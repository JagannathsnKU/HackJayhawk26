import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { radii, spacing, useAppTheme } from '../utils/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, loading, disabled }: Props) {
  const colors = useAppTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: colors.accent, opacity: inactive ? 0.45 : pressed ? 0.9 : 1 },
      ]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <Text style={[styles.label, { color: colors.onAccent }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
});
