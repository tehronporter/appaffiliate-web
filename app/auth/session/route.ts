import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

type SessionBody = {
  accessToken?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SessionBody;

  if (!body.accessToken) {
    return NextResponse.json(
      { error: "Missing access token." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: body.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

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
