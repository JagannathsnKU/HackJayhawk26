import Link from "next/link";
import NexusSpatialShowcase from "@/components/ui/spatial-product-showcase";

export default function HubPage() {
  return (
    <>
      <header className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
        >
          ← Landing
        </Link>
        <Link
          href="/flow"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
        >
          Flow →
        </Link>
      </header>
      <NexusSpatialShowcase />
    </>
  );
}
