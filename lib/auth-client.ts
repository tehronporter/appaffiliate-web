type SessionLike = {
  access_token: string;
} | null;

export async function syncSessionCookie(session: SessionLike) {
  if (!session?.access_token) {
    await fetch("/auth/session", {
      method: "DELETE",
    });
    return;
  }

  await fetch("/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: session.access_token,
    }),
  });
}

export async function clearSessionCookie() {
  await fetch("/auth/session", {
    method: "DELETE",
  });
}
