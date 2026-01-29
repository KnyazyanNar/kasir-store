import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { admin } from "@/lib/firebase-admin";
import { logError } from "@/lib/logger";

const auth = admin.auth();

const SESSION_COOKIE_NAME = "session";
const SESSION_START_COOKIE = "admin_session_start";

// Admin session max age in hours (configurable via env, default 24h)
const ADMIN_SESSION_MAX_HOURS = parseInt(
  process.env.ADMIN_SESSION_MAX_HOURS || "24",
  10
);
const ADMIN_SESSION_MAX_MS = ADMIN_SESSION_MAX_HOURS * 60 * 60 * 1000;

/**
 * Check if the admin session has expired based on the session start timestamp.
 */
function isSessionExpired(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const sessionStart = cookieStore.get(SESSION_START_COOKIE)?.value;

  if (!sessionStart) {
    // No session start cookie means no valid session
    return true;
  }

  const startTime = parseInt(sessionStart, 10);
  if (isNaN(startTime)) {
    return true;
  }

  return Date.now() - startTime > ADMIN_SESSION_MAX_MS;
}

/**
 * Simple email-based admin check with session expiration.
 * Compares user email against ADMIN_EMAIL env variable.
 * Checks session age against ADMIN_SESSION_MAX_HOURS.
 * Redirects to /admin-login if not admin or session expired.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    logError("[auth] ADMIN_EMAIL environment variable is not set");
    redirect("/admin-login");
  }

  const cookieStore = await cookies();

  // Check session age before doing Firebase verification
  if (isSessionExpired(cookieStore)) {
    // Clear stale cookies
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_START_COOKIE);
    redirect("/admin-login");
  }

  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect("/admin-login");
  }

  try {
    // Verify session cookie with Firebase (checks revocation)
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Check if user email matches admin email
    if (decodedClaims.email !== adminEmail) {
      redirect("/admin-login");
    }

    return { id: decodedClaims.uid, email: decodedClaims.email! };
  } catch (error) {
    logError("[auth] Session verification failed", error);
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_START_COOKIE);
    redirect("/admin-login");
  }
}

/**
 * Non-redirecting version of admin check.
 * Returns user info if admin, null otherwise.
 */
export async function checkIsAdmin(): Promise<{ id: string; email: string } | null> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    logError("[auth] ADMIN_EMAIL environment variable is not set");
    return null;
  }

  const cookieStore = await cookies();

  // Check session age
  if (isSessionExpired(cookieStore)) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_START_COOKIE);
    return null;
  }

  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Verify session cookie with Firebase (checks revocation)
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    if (decodedClaims.email !== adminEmail) {
      return null;
    }

    return { id: decodedClaims.uid, email: decodedClaims.email! };
  } catch {
    return null;
  }
}
