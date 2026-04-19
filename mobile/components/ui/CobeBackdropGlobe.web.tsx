import React, { useEffect, useRef, type CSSProperties } from 'react';
import type { CobeBackdropGlobeProps } from './CobeBackdropGlobe.types';

/**
 * Expo web: mount COBE on a real DOM canvas (no WebView).
 */
export function CobeBackdropGlobe({ style }: CobeBackdropGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;
    let globe: { destroy: () => void } | null = null;
    let phi = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    function mount() {
      void import('cobe').then(({ default: createGlobe }) => {
        if (cancelled || !el) return;
        if (globe) {
          try {
            globe.destroy();
          } catch {
            /* noop */
          }
          globe = null;
        }
        el.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
        el.appendChild(canvas);
        const size = Math.max(2, Math.floor(Math.min(el.clientWidth || 2, el.clientHeight || 2)));
        phi = 0;
        globe = createGlobe(canvas, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: size,
          height: size,
          phi: 0,
          theta: 0.22,
          dark: 1,
          diffuse: 1.45,
          scale: 1.78838,
          mapSamples: 12000,
          mapBrightness: 8,
          mapBaseBrightness: 0.08,
          baseColor: [0.1, 0.13, 0.2],
          markerColor: [0.2, 0.8, 0.9],
          glowColor: [0.04, 0.06, 0.1],
          markers: [],
          opacity: 0.96,
          offset: [0, 0],
          onRender: (state: Record<string, unknown>) => {
            phi += 0.0026;
            (state as { phi?: number; theta?: number }).phi = phi;
            (state as { phi?: number; theta?: number }).theta = 0.22;
          },
        });
      });
    }

    mount();
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(mount, 140);
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      ro.disconnect();
      if (globe) {
        try {
          globe.destroy();
        } catch {
          /* noop */
        }
      }
      el.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#030508',
        pointerEvents: 'none',
        ...(typeof style === 'object' && style !== null ? (style as CSSProperties) : {}),
      }}
    />
  );
}
