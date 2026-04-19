import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LiquidGlassPressable } from './LiquidGlassPressable';
import { radii, spacing, useAppTheme } from '../utils/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function Card({ children, onPress, style, padded = true }: Props) {
  const colors = useAppTheme();

  if (onPress) {
    return (
      <LiquidGlassPressable
        onPress={onPress}
        variant="tile"
        pressableStyle={[{ alignSelf: 'stretch' }, style]}
        innerStyle={[padded && styles.padded, { alignItems: 'stretch', justifyContent: 'flex-start' }]}
      >
        {children}
      </LiquidGlassPressable>
    );
  }

  return (
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
