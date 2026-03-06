import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { ServiceError } from "@/lib/services/errors";
import { serviceErrorJson, serviceJson } from "@/lib/services/envelope";
import { getRequestId } from "@/lib/services/request-id";

type SessionBody = {
  accessToken?: string;
};

export async function POST(request: Request) {
  const requestId = await getRequestId(request);

  try {
    const body = (await request.json()) as SessionBody;

    if (!body.accessToken) {
      throw new ServiceError("bad_request", "Missing access token.", {
        status: 400,
      });
    }

    const response = serviceJson(
      {
        sessionSynced: true,
      },
      {
        requestId,
      },
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: body.accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    return serviceErrorJson(error, { requestId });
  }
}

export async function DELETE() {
  const requestId = await getRequestId();
  const response = serviceJson(
    {
      sessionCleared: true,
    },
    {
      requestId,
    },
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
