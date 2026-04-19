import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, useAppTheme } from '../utils/theme';

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

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        compact && !subtitle ? styles.tileCompact : null,
        {
          borderColor: elevated ? colors.accent : colors.border,
          backgroundColor: elevated ? colors.accentMuted : colors.surface,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      accessibilityRole="button"
    >
      {icon ? <Text style={[styles.icon, { color: colors.accent }]}>{icon}</Text> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: 6,
    minHeight: 100,
    justifyContent: 'center',
  },
  tileCompact: {
    minHeight: 76,
    paddingVertical: spacing.md,
  },
  icon: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  sub: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
