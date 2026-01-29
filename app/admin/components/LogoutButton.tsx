"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { logError } from "@/lib/logger";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      // Sign out from Firebase client
      await signOut(auth);

      // Clear session cookie via API
      await fetch("/api/auth/session", {
        method: "DELETE",
      });

      router.push("/admin-login");
      router.refresh();
    } catch (error) {
      logError("[auth] Logout failed", error);
      // Still redirect even if there's an error
      router.push("/admin-login");
      router.refresh();
    }
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
