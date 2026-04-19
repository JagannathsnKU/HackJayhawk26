/**
 * React Native port of the web `StarsBackground` (motion + CSS box-shadow).
 * — Three drifting layers with periods `speed`, `2×speed`, `3×speed` (seconds).
 * — Bottom radial glow ≈ `radial-gradient(ellipse at bottom, #262626 0%, #000 100%)`.
 * — Parallax: device accelerometer (no mouse on phone); skipped on web.
 * — No hero copy; optional `children` render above the field (z-index).
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const STAR_SEED = 20260418;
/** Vertical scroll tile height (aligned with web `h-[2000px]`). */
const STRIP_BASE = 2000;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type StarSpec = { cx: number; cy: number; r: number; opacity: number };

function buildStars(
  count: number,
  stripHeight: number,
  seed: number,
  size: number,
  fieldW: number,
): StarSpec[] {
  const rand = mulberry32(seed);
  const stars: StarSpec[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      cx: rand() * fieldW,
      cy: rand() * stripHeight,
      r: size * (0.55 + rand() * 0.85),
      opacity: 0.2 + rand() * 0.78,
    });
  }
  return stars;
}

type StarStripProps = {
  stars: StarSpec[];
  durationMs: number;
  stripHeight: number;
  width: number;
  fill: string;
};

function StarStrip({ stars, durationMs, stripHeight, width, fill }: StarStripProps) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    y.setValue(0);
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
      <Svg width={width} height={stripHeight * 2} style={styles.svg}>
        {stars.map((s, i) => (
          <Circle key={`a-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill={fill} opacity={s.opacity} />
        ))}
        {stars.map((s, i) => (
          <Circle key={`b-${i}`} cx={s.cx} cy={s.cy + stripHeight} r={s.r} fill={fill} opacity={s.opacity} />
        ))}
      </Svg>
    </Animated.View>
  );
}

export type StarsBackgroundProps = {
  children?: React.ReactNode;
  /** Base layer loop duration in seconds (web default `speed` = 50). */
  speed?: number;
  /** Parallax strength vs accelerometer (web default `factor` = 0.05). */
  factor?: number;
  starColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function StarsBackground({
  children,
  speed = 50,
  factor = 0.05,
  starColor = '#ffffff',
  style,
}: StarsBackgroundProps) {
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
  const fieldW = SCREEN_W;
  const stripH = Math.max(STRIP_BASE, Math.round(SCREEN_H * 1.6));

  const baseMs = speed * 1000;

  const layer1 = useMemo(
    () => buildStars(420, stripH, STAR_SEED, 1, fieldW),
    [stripH, fieldW],
  );
  const layer2 = useMemo(
    () => buildStars(170, stripH * 0.98, STAR_SEED + 1, 1.75, fieldW),
    [stripH, fieldW],
  );
  const layer3 = useMemo(
    () => buildStars(85, stripH * 0.96, STAR_SEED + 2, 2.5, fieldW),
    [stripH, fieldW],
  );

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }
    let subscription: { remove: () => void } | undefined;
    const maxShift = factor * 720;

    import('expo-sensors')
      .then(({ Accelerometer }) => {
        Accelerometer.setUpdateInterval(90);
        subscription = Accelerometer.addListener(({ x, y }) => {
          const nx = Math.max(-1, Math.min(1, x));
          const ny = Math.max(-1, Math.min(1, y));
          translateX.setValue(-nx * maxShift);
          translateY.setValue(ny * maxShift);
        });
      })
      .catch(() => {});

    return () => {
      subscription?.remove();
    };
  }, [factor, translateX, translateY]);

  return (
    <View style={[styles.root, style]} pointerEvents="none" collapsable={false}>
      {/* Ellipse-at-bottom field: #262626 → #000 */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#262626', '#111111', '#000000']}
        locations={[0, 0.35, 0.55, 0.78, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(38, 38, 38, 0.35)', 'transparent', 'transparent']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.starField,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.starStack}>
          <StarStrip stars={layer1} stripHeight={stripH} durationMs={baseMs} width={fieldW} fill={starColor} />
        </View>
        <View style={[styles.starStack, styles.dimMid]} pointerEvents="none">
          <StarStrip stars={layer2} stripHeight={stripH * 0.98} durationMs={baseMs * 2} width={fieldW} fill={starColor} />
        </View>
        <View style={[styles.starStack, styles.dimSoft]} pointerEvents="none">
          <StarStrip stars={layer3} stripHeight={stripH * 0.96} durationMs={baseMs * 3} width={fieldW} fill={starColor} />
        </View>
      </Animated.View>

      {children ? <View style={styles.foreground}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  starStack: {
    ...StyleSheet.absoluteFillObject,
  },
  dimMid: { opacity: 0.88 },
  dimSoft: { opacity: 0.72 },
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
  foreground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
