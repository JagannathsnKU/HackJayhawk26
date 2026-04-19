import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-black text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_#2e2e2e_0%,_#000_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />

      <main className="relative z-10 mx-auto flex max-w-4xl flex-1 flex-col justify-center px-6 py-24">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-zinc-500">
          Nexus
        </p>
        <h1 className="mt-4 max-w-2xl bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-5xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-6xl md:text-7xl">
          Travel intelligence with policy at the core.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          Orchestrate trips, approvals, and treasury signals in one calm surface. No
          starfield here — keep the landing crisp while the hub runs under the stars.
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/hub"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Open hub
          </Link>
          <Link
            href="/flow"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-semibold text-zinc-100 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
          >
            Operations deck
          </Link>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-xs text-zinc-600">
        Pair with the Expo mobile client in <code className="text-zinc-400">/mobile</code>.
      </footer>
    </div>
  );
}
