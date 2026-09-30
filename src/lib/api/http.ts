import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function withHandler(
  handler: (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return fail(error.code, error.message, error.status);
      }

      console.error(error);
      return fail("INTERNAL", "服务器暂时不可用，请稍后重试", 500);
    }
  };
}
