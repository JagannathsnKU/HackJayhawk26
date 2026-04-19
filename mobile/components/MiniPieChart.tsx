import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { spacing, useAppTheme } from '../utils/theme';

type Slice = { label: string; value: number; color: string };

type Props = {
  title?: string;
  slices: Slice[];
  size?: number;
};

/** Lightweight SVG pie — values are relative for proportional display. */
export function MiniPieChart({ title, slices, size = 140 }: Props) {
  const colors = useAppTheme();
  const total = useMemo(() => slices.reduce((s, x) => s + x.value, 0) || 1, [slices]);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  let angle = -Math.PI / 2;
  const paths: { d: string; fill: string }[] = [];
  for (const sl of slices) {
    const sweep = (sl.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    paths.push({ d, fill: sl.color });
  }

  return (
    <View style={styles.wrap}>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      ) : null}
      <View style={styles.row}>
        <Svg width={size} height={size}>
          {paths.map((p, i) => (
            <Path key={i} d={p.d} fill={p.fill} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
          ))}
        </Svg>
        <View style={styles.legend}>
          {slices.map((sl) => (
            <View key={sl.label} style={styles.legendRow}>
              <View style={[styles.swatch, { backgroundColor: sl.color }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {sl.label} · {Math.round((sl.value / total) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: { fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 13, fontWeight: '600', flex: 1 },
});
