import { NextResponse, type NextRequest } from "next/server";

const SESSION_START_COOKIE = "admin_session_start";
const ADMIN_SESSION_MAX_HOURS = parseInt(
  process.env.ADMIN_SESSION_MAX_HOURS || "24",
  10
);
const ADMIN_SESSION_MAX_MS = ADMIN_SESSION_MAX_HOURS * 60 * 60 * 1000;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast session expiration check for admin routes only
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    const sessionCookie = request.cookies.get("session")?.value;
    const sessionStart = request.cookies.get(SESSION_START_COOKIE)?.value;

    // No session at all → redirect to login
    if (!sessionCookie || !sessionStart) {
      const loginUrl = new URL("/admin-login", request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear any stale cookies
      response.cookies.delete("session");
      response.cookies.delete(SESSION_START_COOKIE);
      return response;
    }

    // Session expired → redirect to login
    const startTime = parseInt(sessionStart, 10);
    if (isNaN(startTime) || Date.now() - startTime > ADMIN_SESSION_MAX_MS) {
      const loginUrl = new URL("/admin-login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("session");
      response.cookies.delete(SESSION_START_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
