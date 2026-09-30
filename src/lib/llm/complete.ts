import type { LlmProvider } from "@/lib/types";
import { HttpError } from "@/lib/api/http";
import { buildBriefingPrompt, type PromptSource } from "@/lib/llm/prompt";

type CompleteInput = {
  provider: LlmProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
  sources: PromptSource[];
};

async function readError(response: Response) {
  const text = await response.text();
  return text.slice(0, 280) || `模型接口返回 ${response.status}`;
}

async function completeOpenAICompatible(input: CompleteInput, messages: ReturnType<typeof buildBriefingPrompt>) {
  const endpoint = `${input.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.3,
      messages,
    }),
  });

  if (!response.ok) {
    throw new HttpError("LLM_ERROR", await readError(response), 502);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new HttpError("LLM_ERROR", "模型没有返回可用内容", 502);
  }
  return content;
}

async function completeAnthropic(input: CompleteInput, messages: ReturnType<typeof buildBriefingPrompt>) {
  const system = messages.find((message) => message.role === "system")?.content;
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => ({ role: "user", content: message.content }));

  const endpoint = `${input.baseUrl.replace(/\/$/, "")}/v1/messages`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      max_tokens: 2500,
      temperature: 0.3,
      system,
      messages: userMessages,
    }),
  });

  if (!response.ok) {
    throw new HttpError("LLM_ERROR", await readError(response), 502);
  }

  const json = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const content = json.content?.find((block) => block.type === "text")?.text?.trim();
  if (!content) {
    throw new HttpError("LLM_ERROR", "模型没有返回可用内容", 502);
  }
  return content;
}

export async function generateBriefingMarkdown(input: CompleteInput) {
  const messages = buildBriefingPrompt(input.sources);
  if (input.provider === "anthropic") {
    return completeAnthropic(input, messages);
  }
  return completeOpenAICompatible(input, messages);
}
