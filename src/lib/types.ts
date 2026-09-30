export type LlmProvider = "openai_compatible" | "anthropic";

export type RssFeed = {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  lastFetchedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LlmProfile = {
  id: string;
  name: string;
  provider: LlmProvider;
  baseUrl: string;
  model: string;
  apiKeyHint: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BriefingSummary = {
  id: string;
  date: string;
  title: string;
  modelUsed: string;
  sourceFeedIds: string[];
  createdAt: string;
};

export type Briefing = BriefingSummary & {
  markdown: string;
};

export type GeneratedBriefing = {
  title: string;
  markdown: string;
  modelUsed: string;
  sourceFeedIds: string[];
  sources: Array<{
    feedId: string;
    title: string;
    itemCount: number;
    error?: string;
  }>;
};

export type AuthOptions = {
  github: boolean;
  google: boolean;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};
