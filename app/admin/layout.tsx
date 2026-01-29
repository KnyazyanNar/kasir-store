import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { LogoutButton } from "./components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to "/admin-login" if user is not admin
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Admin Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          {/* Top row: logo + actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <Link href="/admin" className="text-lg md:text-xl font-bold tracking-wider shrink-0">
                KASIR ADMIN
              </Link>
              <nav className="flex items-center gap-4 md:gap-6">
                <Link
                  href="/admin/products"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Products
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <span className="hidden md:inline text-sm text-white/50 truncate max-w-[200px]">
                {profile.email}
              </span>
              <Link
                href="/"
                className="hidden md:inline text-sm text-white/70 hover:text-white transition-colors"
              >
                View Store
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
