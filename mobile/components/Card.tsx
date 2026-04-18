import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, spacing, useAppTheme } from '../utils/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function Card({ children, onPress, style, padded = true }: Props) {
  const colors = useAppTheme();
  const inner = (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.surface, borderColor: colors.border },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.92 }]}
        accessibilityRole="button"
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: spacing.md,
  },
});
