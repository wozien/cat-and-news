import { and, eq } from "drizzle-orm";
import { HttpError, ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { db } from "@/lib/db";
import { llmProfiles } from "@/lib/db/schema";
import { toLlmProfile } from "@/lib/mappers";

export const runtime = "nodejs";

export const POST = withHandler(async (_request, context) => {
  const user = await requireUser();
  const { id } = await context.params;

  const [current] = await db
    .select()
    .from(llmProfiles)
    .where(and(eq(llmProfiles.id, id), eq(llmProfiles.userId, user.id)))
    .limit(1);

  if (!current) {
    throw new HttpError("NOT_FOUND", "模型档案不存在", 404);
  }

  const now = new Date();
  await db
    .update(llmProfiles)
    .set({ isDefault: false, updatedAt: now })
    .where(eq(llmProfiles.userId, user.id));

  const [row] = await db
    .update(llmProfiles)
    .set({ isDefault: true, updatedAt: now })
    .where(eq(llmProfiles.id, id))
    .returning();

  return ok(toLlmProfile(row));
});
