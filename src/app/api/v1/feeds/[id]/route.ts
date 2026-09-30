import { and, eq } from "drizzle-orm";
import { HttpError, ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { parseJson } from "@/lib/api/validate";
import { db } from "@/lib/db";
import { rssFeeds } from "@/lib/db/schema";
import { toRssFeed } from "@/lib/mappers";
import { feedUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

async function getOwnedFeed(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(rssFeeds)
    .where(and(eq(rssFeeds.id, id), eq(rssFeeds.userId, userId)))
    .limit(1);

  if (!row) {
    throw new HttpError("NOT_FOUND", "RSS 源不存在", 404);
  }

  return row;
}

export const PATCH = withHandler(async (request, context) => {
  const user = await requireUser();
  const { id } = await context.params;
  await getOwnedFeed(user.id, id);
  const body = await parseJson(feedUpdateSchema, request);

  const [row] = await db
    .update(rssFeeds)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(and(eq(rssFeeds.id, id), eq(rssFeeds.userId, user.id)))
    .returning();

  return ok(toRssFeed(row));
});

export const DELETE = withHandler(async (_request, context) => {
  const user = await requireUser();
  const { id } = await context.params;
  await getOwnedFeed(user.id, id);

  await db.delete(rssFeeds).where(and(eq(rssFeeds.id, id), eq(rssFeeds.userId, user.id)));
  return ok({ id });
});
