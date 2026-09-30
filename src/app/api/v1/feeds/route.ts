import { desc, eq } from "drizzle-orm";
import { ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { parseJson } from "@/lib/api/validate";
import { db } from "@/lib/db";
import { rssFeeds } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { toRssFeed } from "@/lib/mappers";
import { feedCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export const GET = withHandler(async () => {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(rssFeeds)
    .where(eq(rssFeeds.userId, user.id))
    .orderBy(desc(rssFeeds.createdAt));

  return ok(rows.map(toRssFeed));
});

export const POST = withHandler(async (request) => {
  const user = await requireUser();
  const body = await parseJson(feedCreateSchema, request);
  const now = new Date();

  const [row] = await db
    .insert(rssFeeds)
    .values({
      id: createId(),
      userId: user.id,
      title: body.title,
      url: body.url,
      enabled: body.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return ok(toRssFeed(row), 201);
});
