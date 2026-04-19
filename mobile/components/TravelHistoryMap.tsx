import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Line } from 'react-native-svg';
import { spacing, useAppTheme } from '../utils/theme';

type Pin = { id: string; label: string; x: number; y: number };

const PINS: Pin[] = [
  { id: 'sfo', label: 'SFO', x: 18, y: 42 },
  { id: 'ord', label: 'ORD', x: 28, y: 38 },
  { id: 'nrt', label: 'NRT', x: 86, y: 40 },
  { id: 'lhr', label: 'LHR', x: 48, y: 32 },
  { id: 'bru', label: 'BRU', x: 50, y: 34 },
  { id: 'bog', label: 'BOG', x: 32, y: 62 },
  { id: 'mia', label: 'MIA', x: 30, y: 48 },
];

/** Stylized global map for itinerary visualization. */
export function TravelHistoryMap() {
  const colors = useAppTheme();
  const w = Math.min(Dimensions.get('window').width - 48, 400);

  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text style={[styles.caption, { color: colors.textMuted }]}>Visited hubs (illustrative)</Text>
      <Svg width={w} height={180} viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
        <Ellipse cx={50} cy={36} rx={44} ry={28} fill="rgba(56,189,248,0.08)" stroke={colors.accent} strokeWidth={0.4} />
        {PINS.map((p) => (
          <React.Fragment key={p.id}>
            <Line x1={50} y1={36} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.12)" strokeWidth={0.25} />
            <Circle cx={p.x} cy={p.y} r={2.2} fill={colors.accent} stroke="#041018" strokeWidth={0.4} />
          </React.Fragment>
        ))}
      </Svg>
      <View style={styles.tags}>
        {PINS.map((p) => (
          <View key={p.id} style={[styles.tag, { borderColor: colors.border }]}>
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  caption: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: { fontSize: 11, fontWeight: '700' },
});
