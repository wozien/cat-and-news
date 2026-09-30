import type { ZodType } from "zod";
import { HttpError } from "@/lib/api/http";

export async function parseJson<T>(schema: ZodType<T>, request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw new HttpError("INVALID_JSON", "请求体不是合法 JSON", 400);
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(
      "VALIDATION_ERROR",
      result.error.issues[0]?.message ?? "参数无效",
      422,
    );
  }

  return result.data;
}

export function parseQuery<T>(schema: ZodType<T>, searchParams: URLSearchParams) {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(
      "VALIDATION_ERROR",
      result.error.issues[0]?.message ?? "查询参数无效",
      422,
    );
  }
  return result.data;
}
