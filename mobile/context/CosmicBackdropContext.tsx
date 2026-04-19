import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/** Bottom planet: CSS gradient (Welcome) vs COBE globe WebView (all other routes). */
export type EarthBackdropMode = 'gradient' | 'globe';

type CosmicBackdropContextValue = {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  earthBackdropMode: EarthBackdropMode;
  setEarthBackdropMode: (mode: EarthBackdropMode) => void;
};

const CosmicBackdropContext = createContext<CosmicBackdropContextValue | null>(null);

export function CosmicBackdropProvider({ children }: { children: React.ReactNode }) {
  /** Default 1 keeps global backdrop parallax at 0 (centered planet) without bottom tabs. */
  const [tabIndex, setTabIndexState] = useState(1);
  const setTabIndex = useCallback((index: number) => {
    setTabIndexState(index);
  }, []);

  const [earthBackdropMode, setEarthBackdropModeState] = useState<EarthBackdropMode>('globe');
  const setEarthBackdropMode = useCallback((mode: EarthBackdropMode) => {
    setEarthBackdropModeState(mode);
  }, []);

  const value = useMemo(
    () => ({ tabIndex, setTabIndex, earthBackdropMode, setEarthBackdropMode }),
    [tabIndex, setTabIndex, earthBackdropMode, setEarthBackdropMode],
  );

  return <CosmicBackdropContext.Provider value={value}>{children}</CosmicBackdropContext.Provider>;
}

export function useCosmicBackdrop(): CosmicBackdropContextValue {
  const ctx = useContext(CosmicBackdropContext);
  if (!ctx) {
    throw new Error('useCosmicBackdrop must be used within CosmicBackdropProvider');
  }
  return ctx;
}
