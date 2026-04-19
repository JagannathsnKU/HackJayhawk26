import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

export interface CosmicParallaxBgProps {
  head: string;
  text: string;
  loop?: boolean;
  /** Web only; ignored on native. */
  className?: string;
  showBranding?: boolean;
  ambientParallaxPx?: number;
}

interface Star {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

function generateStars(width: number, height: number): {
  small: Star[];
  medium: Star[];
  large: Star[];
} {
  const make = (count: number, radius: number): Star[] =>
    Array.from({ length: count }, () => ({
      cx: Math.random() * width,
      cy: Math.random() * height * 2,
      r: radius,
      opacity: Math.random() * 0.5 + 0.5,
    }));
  return {
    small: make(700, 0.5),
    medium: make(200, 1),
    large: make(100, 1.5),
  };
}

const WORD_DELAY_MS = [0, 1050, 1750, 2450];
const CYCLE_MS = 7000;
const HOLD_END_MS = 5600;
const FADE_OUT_MS = 6440;

function StarLayer({
  stars,
  duration,
  height,
  width,
}: {
  stars: Star[];
  duration: number;
  height: number;
  width: number;
}) {
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scrollY, {
        toValue: -height,
        duration,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [duration, height, scrollY]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateY: scrollY }], height: height * 2 },
      ]}
    >
      <Svg width={width} height={height * 2}>
        {stars.map((s, i) => (
          <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFF" opacity={s.opacity} />
        ))}
      </Svg>
    </Animated.View>
  );
}

function AnimatedWord({
  word,
  delayMs,
  loop,
  cycleMs,
}: {
  word: string;
  delayMs: number;
  loop: boolean;
  cycleMs: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-26)).current;

  useEffect(() => {
    const enterDuration = 600;
    const holdDuration = HOLD_END_MS - delayMs - enterDuration;
    const exitDuration = FADE_OUT_MS - HOLD_END_MS;
    const restDuration = cycleMs - FADE_OUT_MS;

    const sequence = Animated.sequence([
      Animated.delay(delayMs),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: enterDuration, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: enterDuration, useNativeDriver: true }),
      ]),
      Animated.delay(holdDuration),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: exitDuration, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -4, duration: exitDuration, useNativeDriver: true }),
      ]),
      Animated.delay(restDuration),
    ]);

    const anim = loop ? Animated.loop(sequence) : sequence;
    anim.start();
    return () => anim.stop();
  }, [cycleMs, delayMs, loop, opacity, translateY]);

  return (
    <Animated.Text style={[styles.subPart, { opacity, transform: [{ translateY }] }]}>{word}</Animated.Text>
  );
}

export function CosmicParallaxBg({
  head,
  text,
  loop = true,
  className: _className,
  showBranding = true,
  ambientParallaxPx = 0,
}: CosmicParallaxBgProps) {
  const win = Dimensions.get('window');
  const [size, setSize] = useState({ w: win.width, h: win.height });
  const shift = useRef(new Animated.Value(ambientParallaxPx)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ w: width, h: height });
    }
  };

  useEffect(() => {
    Animated.spring(shift, {
      toValue: ambientParallaxPx,
      useNativeDriver: true,
      friction: 9,
      tension: 40,
    }).start();
  }, [ambientParallaxPx, shift]);

  const stars = useMemo(() => generateStars(size.w, size.h), [size.w, size.h]);
  const textParts = text.split(',').map((p) => p.trim().toUpperCase());

  return (
    <View style={styles.root} onLayout={onLayout}>
      <LinearGradient
        colors={['#090a0f', '#111827', '#1b2735']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.shift, { transform: [{ translateX: shift }] }]}>
        <StarLayer stars={stars.small} duration={50000} height={size.h} width={size.w} />
        <StarLayer stars={stars.medium} duration={100000} height={size.h} width={size.w} />
        <StarLayer stars={stars.large} duration={150000} height={size.h} width={size.w} />

        <View style={styles.horizonLine} />
        <LinearGradient
          colors={['transparent', 'rgba(127,199,255,0.45)', 'transparent']}
          style={styles.horizonGlow}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />

        <View
          style={[
            styles.earthWrap,
            {
              width: size.w * 1.7,
              height: size.w * 1.7,
              bottom: -(size.w * 1.7 * 0.42),
              left: -(size.w * 0.35),
            },
          ]}
        >
          <LinearGradient
            colors={['#2a4a6a', '#0f1724', '#050508']}
            locations={[0, 0.42, 1]}
            style={[StyleSheet.absoluteFill, { borderRadius: size.w * 1.7 }]}
            start={{ x: 0.5, y: 0.32 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      </Animated.View>

      {showBranding ? (
        <View style={styles.textBlock} pointerEvents="none">
          <Text style={styles.head}>{head.toUpperCase()}</Text>
          <View style={styles.subRow}>
            {textParts.map((part, i) => (
              <AnimatedWord
                key={i}
                word={(i > 0 ? '  ' : '') + part}
                delayMs={WORD_DELAY_MS[i] ?? WORD_DELAY_MS[3]}
                loop={loop}
                cycleMs={CYCLE_MS}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#090a0f',
  },
  shift: {
    ...StyleSheet.absoluteFillObject,
  },
  horizonLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0.6,
  },
  horizonGlow: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    bottom: 30,
    height: 220,
  },
  earthWrap: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: '#050508',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 100,
  },
  textBlock: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  head: {
    color: '#fff',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: 'System' }),
    fontWeight: '300',
    fontSize: Math.min(Math.max(Dimensions.get('window').width * 0.07, 28), 52),
    letterSpacing: Dimensions.get('window').width * 0.07 * 0.35,
    textAlign: 'center',
    textShadowColor: 'rgba(150,210,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    marginBottom: 16,
  },
  subRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    overflow: 'hidden',
  },
  subPart: {
    color: '#fff',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: 'System' }),
    fontWeight: '400',
    fontSize: Math.min(Math.max(Dimensions.get('window').width * 0.022, 10), 15),
    letterSpacing: Math.min(Dimensions.get('window').width * 0.022 * 0.2, 3),
  },
});
