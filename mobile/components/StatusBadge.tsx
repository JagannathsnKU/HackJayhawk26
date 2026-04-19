import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ItemStatusBadge, PolicyState, TripHealth } from '../models/types';
import { radii, spacing, useAppTheme } from '../utils/theme';
import { useFormatters } from '../hooks/useFormatters';

type Variant = 'trip' | 'item' | 'policy';

type Props =
  | { variant: 'trip'; value: TripHealth }
  | { variant: 'item'; value: ItemStatusBadge }
  | { variant: 'policy'; value: PolicyState };

export function StatusBadge(props: Props) {
  const colors = useAppTheme();
  const { tripHealthLabel, badgeLabel, policyLabel } = useFormatters();

  let label = '';
  let bg = colors.accentMuted;
  let fg = colors.accent;

  if (props.variant === 'trip') {
    label = tripHealthLabel(props.value);
    if (props.value === 'on_track') {
      bg = `${colors.success}22`;
      fg = colors.success;
    } else if (props.value === 'at_risk') {
      bg = `${colors.warning}22`;
      fg = colors.warning;
    } else {
      bg = `${colors.danger}22`;
      fg = colors.danger;
    }
  } else if (props.variant === 'item') {
    label = badgeLabel(props.value);
    if (props.value === 'safe') {
      bg = `${colors.success}22`;
      fg = colors.success;
    } else if (props.value === 'risk') {
      bg = `${colors.danger}22`;
      fg = colors.danger;
    } else {
      bg = `${colors.accent}22`;
      fg = colors.accent;
    }
  } else {
    label = policyLabel(props.value);
    if (props.value === 'within_policy') {
      bg = `${colors.success}22`;
      fg = colors.success;
    } else if (props.value === 'requires_approval') {
      bg = `${colors.warning}22`;
      fg = colors.warning;
    } else {
      bg = `${colors.danger}22`;
      fg = colors.danger;
    }
  }

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
