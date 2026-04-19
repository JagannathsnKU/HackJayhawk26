import * as React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface LoaderProps {
  size?: number;
  text?: string;
  /** When true, fills the parent (e.g. a Modal). Default false so it can sit in a flex layout. */
  fillContainer?: boolean;
}

/**
 * React Native port of the web ai-loader: gradient backdrop, letter shimmer, rotating ring.
 * (No styled-jsx — uses RN Animated + expo-linear-gradient.)
 */
export const Component: React.FC<LoaderProps> = ({ size = 180, text = 'Generating', fillContainer = false }) => {
  const letters = React.useMemo(() => text.split(''), [text]);
  const spin = React.useRef(new Animated.Value(0)).current;
  const letterOpacity = React.useMemo(
    () => letters.map(() => new Animated.Value(0.4)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild anims when `text` changes
    [text],
  );

  React.useEffect(() => {
    const ring = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    ring.start();
    return () => ring.stop();
  }, [spin]);

  React.useEffect(() => {
    const loops = letterOpacity.map((v, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.delay(2200),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [letterOpacity]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '450deg'],
  });

  const inner = (
    <View style={[styles.center, fillContainer && styles.centerFill]}>
      <View style={[styles.orbWrap, { width: size, height: size }]}>
        <View style={styles.letterRow}>
          {letters.map((letter, index) => (
            <Animated.Text
              key={`${letter}-${index}`}
              style={[styles.letter, { opacity: letterOpacity[index]! }]}
            >
              {letter === ' ' ? '\u00a0' : letter}
            </Animated.Text>
          ))}
        </View>
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
      </View>
    </View>
  );

  if (fillContainer) {
    return (
      <LinearGradient colors={['#1a3379', '#0f172a', '#000000']} style={StyleSheet.absoluteFill}>
        {inner}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a3379', '#0f172a', '#000000']} style={styles.card}>
      {inner}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 200,
    minWidth: 200,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFill: {
    flex: 1,
    width: '100%',
  },
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    zIndex: 2,
  },
  letter: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: 'rgba(56, 189, 248, 0.55)',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
});
