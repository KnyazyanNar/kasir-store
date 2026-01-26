"use client";

import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-white/70 hover:text-white transition-colors"
    >
      Logout
    </button>
  );
}
