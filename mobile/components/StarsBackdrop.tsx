import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const STRIP_H = Math.max(SCREEN_H * 1.8, 1400);
const STAR_SEED = 20260418;

/** Deterministic pseudo-random for stable star positions across mounts. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type StarSpec = { cx: number; cy: number; r: number; opacity: number };

function buildStars(count: number, stripHeight: number, seed: number, size: number): StarSpec[] {
  const rand = mulberry32(seed);
  const stars: StarSpec[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      cx: rand() * SCREEN_W,
      cy: rand() * stripHeight,
      r: size * (0.6 + rand() * 0.8),
      opacity: 0.25 + rand() * 0.75,
    });
  }
  return stars;
}

type LayerProps = {
  stars: StarSpec[];
  durationMs: number;
  stripHeight: number;
};

function StarStrip({ stars, durationMs, stripHeight }: LayerProps) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(y, {
        toValue: -stripHeight,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [durationMs, stripHeight, y]);

  return (
    <Animated.View
      style={[styles.stripWrap, { height: stripHeight * 2, transform: [{ translateY: y }] }]}
      pointerEvents="none"
    >
      <Svg width={SCREEN_W} height={stripHeight * 2} style={styles.svg}>
        {stars.map((s, i) => (
          <Circle key={`a-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="#ffffff" opacity={s.opacity} />
        ))}
        {stars.map((s, i) => (
          <Circle
            key={`b-${i}`}
            cx={s.cx}
            cy={s.cy + stripHeight}
            r={s.r}
            fill="#ffffff"
            opacity={s.opacity}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

/**
 * Deep-field star drift + bottom glow (approximates the web StarsBackground look in RN).
 */
export function StarsBackdrop() {
  const h1 = STRIP_H;
  const h2 = STRIP_H * 0.95;
  const h3 = STRIP_H * 0.9;

  const layer1 = useMemo(() => buildStars(220, h1, STAR_SEED, 1), [h1]);
  const layer2 = useMemo(() => buildStars(90, h2, STAR_SEED + 1, 1.8), [h2]);
  const layer3 = useMemo(() => buildStars(45, h3, STAR_SEED + 2, 2.6), [h3]);

  return (
    <View style={styles.root} pointerEvents="none" collapsable={false}>
      <LinearGradient
        colors={['#0a0a0a', '#141414', '#000000']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['transparent', 'rgba(38, 38, 38, 0.55)', 'rgba(0, 0, 0, 0.95)']}
        locations={[0, 0.35, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.starStack}>
        <StarStrip stars={layer1} stripHeight={h1} durationMs={110000} />
      </View>
      <View style={[styles.starStack, styles.dim]} pointerEvents="none">
        <StarStrip stars={layer2} stripHeight={h2} durationMs={160000} />
      </View>
      <View style={[styles.starStack, styles.dimMore]} pointerEvents="none">
        <StarStrip stars={layer3} stripHeight={h3} durationMs={210000} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  starStack: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: { opacity: 0.85 },
  dimMore: { opacity: 0.7 },
  stripWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
