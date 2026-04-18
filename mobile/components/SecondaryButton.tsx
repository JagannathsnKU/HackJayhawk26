import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { radii, spacing, useAppTheme } from '../utils/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SecondaryButton({ title, onPress, disabled }: Props) {
  const colors = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          borderColor: colors.border,
          backgroundColor: colors.surfaceElevated,
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
        },
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
