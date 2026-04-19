import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../utils/theme';

/** Compact app name for inner screens (not the landing hero). */
export function NexusBrandLine() {
  const colors = useAppTheme();
  return <Text style={[styles.text, { color: colors.textMuted }]}>Nexus</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
});
