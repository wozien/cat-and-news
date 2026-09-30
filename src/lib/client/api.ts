type ApiSuccess<T> = { data: T };
type ApiFailure = { error: { code: string; message: string } };

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || "error" in json) {
    const error = "error" in json ? json.error : { code: "UNKNOWN", message: "请求失败" };
    throw new ApiError(error.code, error.message, response.status);
  }

  return json.data;
}
