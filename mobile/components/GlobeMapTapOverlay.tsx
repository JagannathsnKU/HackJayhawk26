import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useCosmicBackdrop } from '../context/CosmicBackdropContext';
import { GLOBE_MAP_FROM_GLOBE_ENABLED, isGlobeMapHostRoute } from '../config/globeMapFeature';
import { navigationRef } from '../navigation/navigationRef';
import { getEarthGlobeLayout } from '../utils/earthGlobeOverlayLayout';

type Props = {
  currentRouteName: string | undefined;
  navigationReady: boolean;
};

/**
 * Invisible hit target aligned with the COBE globe mask (only on allowed routes
 * such as MainHome). Elsewhere the globe is visual-only.
 */
export function GlobeMapTapOverlay({ currentRouteName, navigationReady }: Props) {
  const { width } = useWindowDimensions();
  const { earthBackdropMode } = useCosmicBackdrop();

  if (!GLOBE_MAP_FROM_GLOBE_ENABLED) return null;
  if (!navigationReady) return null;
  if (earthBackdropMode !== 'globe') return null;
  if (currentRouteName === 'GlobeMap') return null;
  if (!isGlobeMapHostRoute(currentRouteName)) return null;

  const { earthDiameter, earthBottom, earthLeft, earthRadius } = getEarthGlobeLayout(width);

  const onPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('GlobeMap');
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.hit,
        {
          width: earthDiameter,
          height: earthDiameter,
          bottom: earthBottom,
          left: Math.round(earthLeft),
          borderRadius: earthRadius,
        },
      ]}
      accessibilityLabel="Open map"
      accessibilityRole="button"
    />
  );
}

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
    zIndex: 6,
    elevation: 6,
    backgroundColor: 'transparent',
  },
});
