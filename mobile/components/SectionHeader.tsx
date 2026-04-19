import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useAppTheme } from '../utils/theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  const colors = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
