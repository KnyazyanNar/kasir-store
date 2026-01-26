import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin";
import { LogoutButton } from "./components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to "/" if user is not admin
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold tracking-wider">
              KASIR ADMIN
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/admin/products"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">{profile.email}</span>
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              View Store
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
