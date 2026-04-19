import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CosmicParallaxBg } from './ui/parallax-cosmic-background';
import { useCosmicBackdrop } from '../context/CosmicBackdropContext';

/** Horizontal shift per tab index for a subtle navigation parallax (center tab ≈ 0). */
const PARALLAX_PER_TAB = 16;

/**
 * Full-screen starfield + horizon (no hero copy). Sits behind the navigation tree.
 */
export function GlobalCosmicBackdrop() {
  const { tabIndex, earthBackdropMode } = useCosmicBackdrop();
  const ambientParallaxPx = (tabIndex - 1) * PARALLAX_PER_TAB;

  return (
    <View style={styles.layer} pointerEvents="none" collapsable={false}>
      <CosmicParallaxBg
        head=""
        text=""
        loop
        showBranding={false}
        ambientParallaxPx={ambientParallaxPx}
        earthBackdropMode={earthBackdropMode}
        className="min-h-0 min-w-0 h-full w-full"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
