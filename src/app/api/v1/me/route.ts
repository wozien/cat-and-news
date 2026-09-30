import { ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";

export const runtime = "nodejs";

export const GET = withHandler(async () => {
  const user = await requireUser();
  return ok({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  });
});
