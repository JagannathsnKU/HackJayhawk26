"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

export interface GlobePulseProps {
  className?: string;
  /** Auto-rotation speed (radians per frame step inside onRender). */
  speed?: number;
}

/**
 * COBE globe for Next.js (Tailwind). No pulse rings / no markers — background-style globe only.
 */
export function GlobePulse({ className = "", speed = 0.003 }: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  const handlePointerDown = useCallback(() => {
    /* background: no drag handling to avoid stealing page interactions */
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let globe: ReturnType<typeof createGlobe> | null = null;
    phiRef.current = 0;

    const width = canvas.offsetWidth;
    if (width <= 0) return;

    globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2),
      width,
      height: width,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 10,
      mapBaseBrightness: 0.08,
      baseColor: [0.12, 0.14, 0.2],
      markerColor: [0.2, 0.8, 0.9],
      glowColor: [0.05, 0.05, 0.08],
      markers: [],
      opacity: 0.92,
      offset: [0, 0],
      onRender: (state) => {
        phiRef.current += speed;
        state.phi = phiRef.current;
        state.theta = 0.2;
      },
    });

    canvas.style.opacity = "1";

    return () => {
      globe?.destroy();
    };
  }, [speed]);

  return (
    <div className={`relative aspect-square w-full max-w-full select-none pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="h-full w-full rounded-full touch-none"
        style={{
          cursor: "default",
          opacity: 0,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
