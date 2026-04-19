import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LiquidGlassPressable } from './LiquidGlassPressable';
import { spacing, useAppTheme } from '../utils/theme';

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
    <LiquidGlassPressable
      onPress={onPress}
      disabled={inactive}
      variant="primary"
      minHeight={52}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
      )}
    </LiquidGlassPressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
});
