import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  head: string;
  /** Comma-separated subtitle phrases */
  text: string;
  /** Optional mark above the wordmark (e.g. Nexus logo from require()). */
  logo?: number;
};

/**
 * Hero copy for the welcome route only (global backdrop supplies the starfield).
 */
export function CosmicLandingBranding({ head, text, logo }: Props) {
  const parts = text.split(',').map((p) => p.trim().toUpperCase());
  const w = Dimensions.get('window').width;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {logo ? (
        <View style={styles.logoSlot}>
          <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Nexus logo" />
        </View>
      ) : null}
      <Text
        style={[styles.head, { fontSize: Math.min(Math.max(w * 0.07, 28), 52), letterSpacing: w * 0.07 * 0.35 }]}
      >
        {head.toUpperCase()}
      </Text>
      <View style={styles.subWrap}>
        <View style={styles.row}>
          {parts.map((part, i) => (
            <Text
              key={i}
              style={[
                styles.sub,
                {
                  fontSize: Math.min(Math.max(w * 0.022, 10), 15),
                  letterSpacing: Math.min(w * 0.022 * 0.2, 3),
                },
              ]}
            >
              {i > 0 ? '  ' : ''}
              {part}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: 'transparent',
  },
  head: {
    width: '100%',
    color: '#fff',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: 'System' }),
    fontWeight: '300',
    textAlign: 'center',
    textShadowColor: 'rgba(150,210,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    marginBottom: 14,
  },
  subWrap: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 360,
  },
  sub: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'System' }),
    fontWeight: '400',
    textAlign: 'center',
  },
});
