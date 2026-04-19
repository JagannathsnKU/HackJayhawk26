import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LiquidGlassPressable } from './LiquidGlassPressable';
import { spacing, useAppTheme } from '../utils/theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress: () => void;
  variant?: 'default' | 'accent';
  /** Tighter tile when there is no subtitle. */
  compact?: boolean;
};

export function HubTile({ title, subtitle, icon, onPress, variant = 'default', compact }: Props) {
  const colors = useAppTheme();
  const elevated = variant === 'accent';
  const minH = compact && !subtitle ? 76 : 100;

  return (
    <LiquidGlassPressable
      onPress={onPress}
      variant={elevated ? 'tileAccent' : 'tile'}
      minHeight={minH}
      innerStyle={[
        styles.inner,
        compact && !subtitle ? styles.innerCompact : null,
      ]}
    >
      {icon ? <Text style={[styles.icon, { color: colors.accent }]}>{icon}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </LiquidGlassPressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: 6,
  },
  innerCompact: {
    paddingVertical: spacing.md,
  },
  icon: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  sub: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
