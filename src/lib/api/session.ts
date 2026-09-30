import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HttpError } from "@/lib/api/http";

export async function requireUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new HttpError("UNAUTHORIZED", "请先登录", 401);
  }

  return session.user;
}
