import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";

export default function FlowPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-28 text-zinc-100">
      <header className="mb-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
        >
          ← Landing
        </Link>
        <Link
          href="/hub"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
        >
          Hub →
        </Link>
      </header>

      <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
        Operations
      </p>
      <h1 className="mt-3 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
        Claims runway
      </h1>
      <p className="mt-5 max-w-prose leading-relaxed text-zinc-400">
        Same typographic rhythm as the spatial shell — tight tracking on labels, soft
        gradient headlines, and glassy panels for dense data without the product
        carousel.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-zinc-300">
            <Shield size={18} className="text-emerald-400" />
            <span className="text-sm font-semibold">Policy lock</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Every adjustment carries a hash trail so finance can replay decisions.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles size={18} className="text-sky-400" />
            <span className="text-sm font-semibold">Assist lane</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Model output stays inside the policy envelope you already approved.
          </p>
        </div>
      </div>
    </div>
  );
}
