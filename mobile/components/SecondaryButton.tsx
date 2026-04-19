import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LiquidGlassPressable } from './LiquidGlassPressable';
import { spacing, useAppTheme } from '../utils/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SecondaryButton({ title, onPress, disabled }: Props) {
  const colors = useAppTheme();

  return (
    <LiquidGlassPressable onPress={onPress} disabled={disabled} variant="secondary" minHeight={48}>
      <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
    </LiquidGlassPressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
});
