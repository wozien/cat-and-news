import type { InferSelectModel } from "drizzle-orm";
import type { briefings, llmProfiles, rssFeeds } from "@/lib/db/schema";
import type { Briefing, LlmProfile, LlmProvider, RssFeed } from "@/lib/types";

function toIso(value: Date | null) {
  return value ? value.toISOString() : null;
}

export function toRssFeed(row: InferSelectModel<typeof rssFeeds>): RssFeed {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    enabled: row.enabled,
    lastFetchedAt: toIso(row.lastFetchedAt),
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toLlmProfile(row: InferSelectModel<typeof llmProfiles>): LlmProfile {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider as LlmProvider,
    baseUrl: row.baseUrl,
    model: row.model,
    apiKeyHint: row.apiKeyHint,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toBriefing(row: InferSelectModel<typeof briefings>): Briefing {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    markdown: row.markdown,
    sourceFeedIds: row.sourceFeedIds,
    modelUsed: row.modelUsed,
    createdAt: row.createdAt.toISOString(),
  };
}
