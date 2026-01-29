import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { admin } from "@/lib/firebase-admin";
import { logError } from "@/lib/logger";

const auth = admin.auth();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE_NAME = "session";
const SESSION_START_COOKIE = "admin_session_start";

// Admin session max age in hours (configurable via env, default 24h)
const ADMIN_SESSION_MAX_HOURS = parseInt(
  process.env.ADMIN_SESSION_MAX_HOURS || "24",
  10
);
const ADMIN_SESSION_MAX_MS = ADMIN_SESSION_MAX_HOURS * 60 * 60 * 1000;

/**
 * POST /api/auth/session
 * Create a session cookie from Firebase ID token
 */
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Create session cookie with same max age as admin session
    const expiresIn = ADMIN_SESSION_MAX_MS;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const maxAgeSecs = Math.floor(expiresIn / 1000);
    const cookieStore = await cookies();

    // Set the Firebase session cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSecs,
      path: "/",
    });

    // Set the session start timestamp cookie
    cookieStore.set(SESSION_START_COOKIE, String(Date.now()), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSecs,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      email: decodedToken.email,
    });
  } catch (error) {
    logError("[auth] Failed to create session", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clear the session cookie (logout)
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Revoke session on Firebase side if exists
    if (sessionCookie) {
      try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie);
        await auth.revokeRefreshTokens(decodedClaims.sub);
      } catch {
        // Session might be invalid, continue with deletion
      }
    }

    // Clear both cookies
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_START_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("[auth] Failed to logout", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
