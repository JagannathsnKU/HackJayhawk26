import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, spacing } from '../utils/theme';

export type LiquidGlassVariant =
  | 'primary'
  | 'secondary'
  | 'tile'
  | 'tileAccent'
  | 'chip'
  | 'chipActive';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  variant: LiquidGlassVariant;
  children: React.ReactNode;
  minHeight?: number;
  pressableStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

/**
 * Frosted “liquid glass” surface: native blur + soft gradients + specular edge.
 * Web uses gradient-only fallback (no BlurView).
 */
export function LiquidGlassPressable({
  onPress,
  disabled,
  variant,
  children,
  minHeight,
  pressableStyle,
  innerStyle,
  borderRadius: borderRadiusProp,
  accessibilityRole = 'button',
  accessibilityState,
}: Props) {
  const isWeb = Platform.OS === 'web';
  const isPrimary = variant === 'primary';
  const isTileAccent = variant === 'tileAccent';
  const isTile = variant === 'tile' || isTileAccent;
  const isChip = variant === 'chip' || variant === 'chipActive';
  const isChipActive = variant === 'chipActive';
  const borderRadius = borderRadiusProp ?? (isChip ? radii.pill : radii.lg);
  const resolvedMinHeight =
    minHeight ?? (isPrimary ? 52 : isTile ? 88 : isChip ? 42 : 48);
  const borderColor = isPrimary
    ? 'rgba(255,255,255,0.45)'
    : isTileAccent || isChipActive
      ? 'rgba(255,255,255,0.38)'
      : isTile
        ? 'rgba(255,255,255,0.22)'
        : isChip
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.26)';
  const blurIntensity = isPrimary ? 42 : isTile ? 32 : isChip ? (isChipActive ? 30 : 22) : 28;

  let grad0: string;
  let grad1: string;
  let grad2: string;
  if (isPrimary || isTileAccent || isChipActive) {
    grad0 = 'rgba(255,255,255,0.22)';
    grad1 = 'rgba(255,255,255,0.07)';
    grad2 = 'rgba(255,255,255,0.14)';
  } else if (isTile || isChip) {
    grad0 = 'rgba(255,255,255,0.11)';
    grad1 = 'rgba(255,255,255,0.04)';
    grad2 = 'rgba(255,255,255,0.09)';
  } else {
    grad0 = 'rgba(255,255,255,0.14)';
    grad1 = 'rgba(255,255,255,0.05)';
    grad2 = 'rgba(255,255,255,0.10)';
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressWrap,
        { opacity: disabled ? 0.42 : pressed ? 0.9 : 1 },
        ...(Platform.OS === 'web'
          ? [{ outlineWidth: 0, outlineColor: 'transparent' } as ViewStyle]
          : []),
        pressableStyle,
      ]}
    >
      <View
        style={[
          styles.shell,
          {
            minHeight: resolvedMinHeight,
            borderRadius,
            borderColor,
          },
        ]}
      >
        {!isWeb ? (
          <BlurView
            tint="dark"
            intensity={blurIntensity}
            style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          />
        ) : null}
        <LinearGradient
          colors={[grad0, grad1, grad2]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        />
        {isWeb ? (
          <LinearGradient
            colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.05)']}
            style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          />
        ) : null}
        <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.12)', 'transparent']}
          locations={[0, 0.2, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.55 }}
          style={[styles.gloss, { borderRadius }]}
          pointerEvents="none"
        />
        <View
          style={[
            styles.inner,
            { minHeight: resolvedMinHeight, paddingHorizontal: isChip ? spacing.sm : spacing.md },
            innerStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    alignSelf: 'stretch',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  shell: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    position: 'relative',
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  inner: {
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
