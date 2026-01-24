import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm tracking-[0.32em] text-white/60">ORDER</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          Thank you for your order
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
          Your KASIR piece is on the way.
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-medium tracking-wide text-white transition hover:border-white/40"
          >
            Back to store
          </Link>
        </div>
      </div>
    </main>
  );
}

