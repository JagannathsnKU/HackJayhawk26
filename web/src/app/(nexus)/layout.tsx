"use client";

import { StarsBackground } from "@/components/ui/stars";

export default function NexusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StarsBackground className="min-h-dvh">
      <div className="relative z-10 min-h-dvh">{children}</div>
    </StarsBackground>
  );
}
