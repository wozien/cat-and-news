import { and, eq } from "drizzle-orm";
import { HttpError, ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { parseJson } from "@/lib/api/validate";
import { encryptSecret, maskSecret } from "@/lib/crypto";
import { db } from "@/lib/db";
import { llmProfiles } from "@/lib/db/schema";
import { toLlmProfile } from "@/lib/mappers";
import { llmUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

async function getOwnedProfile(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(llmProfiles)
    .where(and(eq(llmProfiles.id, id), eq(llmProfiles.userId, userId)))
    .limit(1);

  if (!row) {
    throw new HttpError("NOT_FOUND", "模型档案不存在", 404);
  }

  return row;
}

export const PATCH = withHandler(async (request, context) => {
  const user = await requireUser();
  const { id } = await context.params;
  await getOwnedProfile(user.id, id);
  const body = await parseJson(llmUpdateSchema, request);
  const now = new Date();

  if (body.isDefault) {
    await db
      .update(llmProfiles)
      .set({ isDefault: false, updatedAt: now })
      .where(eq(llmProfiles.userId, user.id));
  }

  const [row] = await db
    .update(llmProfiles)
    .set({
      name: body.name,
      provider: body.provider,
      baseUrl: body.baseUrl,
      model: body.model,
      isDefault: body.isDefault,
      ...(body.apiKey
        ? {
            apiKeyEncrypted: encryptSecret(body.apiKey),
            apiKeyHint: maskSecret(body.apiKey),
          }
        : {}),
      updatedAt: now,
    })
    .where(and(eq(llmProfiles.id, id), eq(llmProfiles.userId, user.id)))
    .returning();

  return ok(toLlmProfile(row));
});

export const DELETE = withHandler(async (_request, context) => {
  const user = await requireUser();
  const { id } = await context.params;
  const current = await getOwnedProfile(user.id, id);

  await db.delete(llmProfiles).where(and(eq(llmProfiles.id, id), eq(llmProfiles.userId, user.id)));

  if (current.isDefault) {
    const [next] = await db
      .select()
      .from(llmProfiles)
      .where(eq(llmProfiles.userId, user.id))
      .limit(1);

    if (next) {
      await db
        .update(llmProfiles)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(llmProfiles.id, next.id));
    }
  }

  return ok({ id });
});
