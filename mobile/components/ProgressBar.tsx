import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, useAppTheme } from '../utils/theme';

type Props = {
  label?: string;
  current: number;
  max: number;
};

export function ProgressBar({ label, current, max }: Props) {
  const colors = useAppTheme();
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((current / max) * 100));

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.accent }]} />
      </View>
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        {`$${current} / $${max} limit`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  caption: {
    fontSize: 12,
  },
});
