import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Simple email-based admin check.
 * Compares user email against ADMIN_EMAIL env variable.
 * Redirects to /admin-login if not admin.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createSupabaseServerClient();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("ADMIN_EMAIL environment variable is not set");
    redirect("/admin-login");
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin-login");
  }

  // Check if user email matches admin email
  if (user.email !== adminEmail) {
    redirect("/admin-login");
  }

  return { id: user.id, email: user.email };
}

/**
 * Non-redirecting version of admin check.
 * Returns user info if admin, null otherwise.
 */
export async function checkIsAdmin(): Promise<{ id: string; email: string } | null> {
  const supabase = await createSupabaseServerClient();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("ADMIN_EMAIL environment variable is not set");
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== adminEmail) {
    return null;
  }

  return { id: user.id, email: user.email };
}