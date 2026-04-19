import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CosmicBackdropContextValue = {
  tabIndex: number;
  setTabIndex: (index: number) => void;
};

const CosmicBackdropContext = createContext<CosmicBackdropContextValue | null>(null);

export function CosmicBackdropProvider({ children }: { children: React.ReactNode }) {
  const [tabIndex, setTabIndexState] = useState(0);
  const setTabIndex = useCallback((index: number) => {
    setTabIndexState(index);
  }, []);

  const value = useMemo(() => ({ tabIndex, setTabIndex }), [tabIndex, setTabIndex]);

  return <CosmicBackdropContext.Provider value={value}>{children}</CosmicBackdropContext.Provider>;
}

export function useCosmicBackdrop(): CosmicBackdropContextValue {
  const ctx = useContext(CosmicBackdropContext);
  if (!ctx) {
    throw new Error('useCosmicBackdrop must be used within CosmicBackdropProvider');
  }
  return ctx;
}
