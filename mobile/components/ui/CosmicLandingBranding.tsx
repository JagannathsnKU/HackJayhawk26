import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  head: string;
  /** Comma-separated subtitle phrases */
  text: string;
};

/**
 * Hero copy for the welcome route only (global backdrop supplies the starfield).
 */
export function CosmicLandingBranding({ head, text }: Props) {
  const parts = text.split(',').map((p) => p.trim().toUpperCase());
  const w = Dimensions.get('window').width;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={[styles.head, { fontSize: Math.min(Math.max(w * 0.07, 28), 52), letterSpacing: w * 0.07 * 0.35 }]}>
        {head.toUpperCase()}
      </Text>
      <View style={styles.row}>
        {parts.map((part, i) => (
          <Text
            key={i}
            style={[
              styles.sub,
              { fontSize: Math.min(Math.max(w * 0.022, 10), 15), letterSpacing: Math.min(w * 0.022 * 0.2, 3) },
            ]}
          >
            {i > 0 ? '  ' : ''}
            {part}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  head: {
    color: '#fff',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: 'System' }),
    fontWeight: '300',
    textAlign: 'center',
    textShadowColor: 'rgba(150,210,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sub: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'System' }),
    fontWeight: '400',
  },
});
