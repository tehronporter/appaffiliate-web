import { headers } from "next/headers";

const REQUEST_ID_HEADER = "x-request-id";

function normalizeRequestId(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, 120);
}

export async function getRequestId(request?: Request) {
  const requestHeaderValue = request?.headers.get(REQUEST_ID_HEADER);

  if (requestHeaderValue) {
    return normalizeRequestId(requestHeaderValue) ?? crypto.randomUUID();
  }

  const headerStore = await headers();
  const fallbackHeaderValue =
    headerStore.get(REQUEST_ID_HEADER) ?? headerStore.get("x-vercel-id");

  return normalizeRequestId(fallbackHeaderValue) ?? crypto.randomUUID();
}

export function applyRequestIdHeader<T extends Response>(
  response: T,
  requestId: string,
) {
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}
