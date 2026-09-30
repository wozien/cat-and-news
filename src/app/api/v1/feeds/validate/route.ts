import { HttpError, ok, withHandler } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { parseJson } from "@/lib/api/validate";
import { validateRssUrl } from "@/lib/rss/parse";
import { feedValidateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export const POST = withHandler(async (request) => {
  await requireUser();
  const body = await parseJson(feedValidateSchema, request);

  try {
    const result = await validateRssUrl(body.url);
    return ok(result);
  } catch (error) {
    throw new HttpError(
      "INVALID_FEED",
      error instanceof Error ? error.message : "无法解析该 RSS 源",
      422,
    );
  }
});
