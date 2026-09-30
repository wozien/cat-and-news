import { and, desc, eq } from "drizzle-orm";
import { ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { parseJson, parseQuery } from "@/lib/api/validate";
import { db } from "@/lib/db";
import { briefings } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { toBriefing } from "@/lib/mappers";
import { briefingListQuerySchema, briefingSaveSchema } from "@/lib/validators";

export const runtime = "nodejs";

export const GET = withHandler(async (request) => {
  const user = await requireUser();
  const query = parseQuery(briefingListQuerySchema, new URL(request.url).searchParams);

  const rows = await db
    .select()
    .from(briefings)
    .where(
      query.date
        ? and(eq(briefings.userId, user.id), eq(briefings.date, query.date))
        : eq(briefings.userId, user.id),
    )
    .orderBy(desc(briefings.createdAt));

  return ok(rows.map((row) => {
    const briefing = toBriefing(row);
    return {
      id: briefing.id,
      date: briefing.date,
      title: briefing.title,
      modelUsed: briefing.modelUsed,
      sourceFeedIds: briefing.sourceFeedIds,
      createdAt: briefing.createdAt,
    };
  }));
});

export const POST = withHandler(async (request) => {
  const user = await requireUser();
  const body = await parseJson(briefingSaveSchema, request);
  const now = new Date();

  const [row] = await db
    .insert(briefings)
    .values({
      id: createId(),
      userId: user.id,
      date: body.date,
      title: body.title,
      markdown: body.markdown,
      sourceFeedIds: body.sourceFeedIds,
      modelUsed: body.modelUsed,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return ok(toBriefing(row), 201);
});
