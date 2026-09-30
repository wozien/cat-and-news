import { desc, eq } from "drizzle-orm";
import { ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { parseJson } from "@/lib/api/validate";
import { encryptSecret, maskSecret } from "@/lib/crypto";
import { db } from "@/lib/db";
import { llmProfiles } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { toLlmProfile } from "@/lib/mappers";
import { llmCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export const GET = withHandler(async () => {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(llmProfiles)
    .where(eq(llmProfiles.userId, user.id))
    .orderBy(desc(llmProfiles.createdAt));

  return ok(rows.map(toLlmProfile));
});

export const POST = withHandler(async (request) => {
  const user = await requireUser();
  const body = await parseJson(llmCreateSchema, request);
  const now = new Date();

  const existing = await db
    .select({ id: llmProfiles.id })
    .from(llmProfiles)
    .where(eq(llmProfiles.userId, user.id));

  const shouldDefault = body.isDefault || existing.length === 0;

  if (shouldDefault && existing.length > 0) {
    await db
      .update(llmProfiles)
      .set({ isDefault: false, updatedAt: now })
      .where(eq(llmProfiles.userId, user.id));
  }

  const [row] = await db
    .insert(llmProfiles)
    .values({
      id: createId(),
      userId: user.id,
      name: body.name,
      provider: body.provider,
      baseUrl: body.baseUrl,
      model: body.model,
      apiKeyEncrypted: encryptSecret(body.apiKey),
      apiKeyHint: maskSecret(body.apiKey),
      isDefault: shouldDefault,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return ok(toLlmProfile(row), 201);
});
