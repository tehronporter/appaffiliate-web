import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "appaffiliate-access-token";
const REQUEST_PATH_HEADER = "x-appaffiliate-request-path";

const WORKSPACE_PATH_PREFIXES = [
  "/dashboard",
  "/setup",
  "/review",
  "/creators",
  "/earnings",
  "/partners",
  "/codes",
  "/events",
  "/commissions",
  "/payouts",
  "/payout-batches",
  "/settings",
  "/unattributed",
  "/onboarding",
  "/apps",
  "/apple-health",
];

function buildRedirect(request: NextRequest, redirectTo: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("redirectTo", redirectTo);
  return url;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isPortalPath = pathname === "/portal" || pathname.startsWith("/portal/");
  const isWorkspacePath = WORKSPACE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const requestPath = `${pathname}${request.nextUrl.search}`;

  if (!hasSession && isPortalPath) {
    return NextResponse.redirect(buildRedirect(request, requestPath));
  }

  if (!hasSession && isWorkspacePath) {
    return NextResponse.redirect(buildRedirect(request, requestPath));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_PATH_HEADER, requestPath);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setup/:path*",
    "/setup",
    "/review/:path*",
    "/review",
    "/creators/:path*",
    "/creators",
    "/earnings/:path*",
    "/earnings",
    "/partners/:path*",
    "/codes/:path*",
    "/events/:path*",
    "/commissions/:path*",
    "/payouts/:path*",
    "/payout-batches/:path*",
    "/settings/:path*",
    "/unattributed/:path*",
    "/onboarding/:path*",
    "/apps/:path*",
    "/portal/:path*",
    "/portal",
    "/apple-health/:path*",
    "/apple-health",
  ],
};
