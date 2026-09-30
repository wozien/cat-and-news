import { getConfiguredOAuthProviders } from "@/lib/auth";
import { ok } from "@/lib/api/http";

export const runtime = "nodejs";

export function GET() {
  return ok(getConfiguredOAuthProviders());
}
