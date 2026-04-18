import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { AnomalousMatterHeroProps } from './anomalous-matter-hero.types';
import { GenerativeMeshGl } from './GenerativeMeshGl';
import { useAppTheme } from '../../utils/theme';

const MESH_BG = '#000000';
const MESH_LINE = '#ffffff';

export function AnomalousMatterHero({
  title = 'Welcome',
  subtitle = '',
  description = '',
}: AnomalousMatterHeroProps) {
  const colors = useAppTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <View style={[styles.section, { backgroundColor: MESH_BG }]} accessibilityRole="header">
      <GenerativeMeshGl meshColor={MESH_LINE} backgroundColor={MESH_BG} />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)', MESH_BG]}
        locations={[0, 0.5, 1]}
        style={styles.fade}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <Animated.View style={[styles.copyBlock, { opacity, transform: [{ translateY }] }]}>
          <Text style={[styles.kicker, { color: colors.textMuted }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>
          {description ? (
            <Text style={[styles.body, { color: colors.textSecondary }]}>{description}</Text>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
    zIndex: 20,
  },
  copyBlock: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 340,
  },
});
