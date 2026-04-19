import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SampleItinerary } from '../utils/sampleItineraries';
import { radii, spacing, useAppTheme } from '../utils/theme';
import { Card } from './Card';
import { LiquidGlassPressable } from './LiquidGlassPressable';

type Props = {
  itinerary: SampleItinerary;
  /** Read-only list — no checkboxes (planning hub, badges archive). */
  mode?: 'checklist' | 'readonly';
};

export function SampleItineraryChecklist({ itinerary, mode = 'checklist' }: Props) {
  const colors = useAppTheme();
  const readonly = mode === 'readonly';
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const total = itinerary.activities.length;
  const completed = itinerary.activities.filter((a) => done[a.id]).length;

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{itinerary.title}</Text>
          <Text style={[styles.source, { color: colors.textMuted }]}>{itinerary.sourceFile}</Text>
          <Text style={[styles.route, { color: colors.textSecondary }]}>{itinerary.routeSummary}</Text>
        </View>
        {!readonly ? (
          <Text style={[styles.progress, { color: colors.accent }]}>
            {completed}/{total}
          </Text>
        ) : null}
      </View>

      <View style={styles.list}>
        {itinerary.activities.map((act) => {
          const checked = Boolean(done[act.id]);
          if (readonly) {
            return (
              <View
                key={act.id}
                style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              >
                <View style={styles.bulletCol}>
                  <Text style={[styles.bullet, { color: colors.textMuted }]}>•</Text>
                </View>
                <View style={styles.body}>
                  <Text style={[styles.time, { color: colors.textMuted }]}>{act.timeLabel}</Text>
                  <Text style={[styles.actTitle, { color: colors.text }]}>{act.title}</Text>
                  {act.detail ? (
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>{act.detail}</Text>
                  ) : null}
                </View>
              </View>
            );
          }
          return (
            <LiquidGlassPressable
              key={act.id}
              onPress={() => toggle(act.id)}
              variant={checked ? 'tileAccent' : 'tile'}
              minHeight={64}
              innerStyle={styles.rowInner}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
            >
              <View style={[styles.box, { borderColor: colors.accent, backgroundColor: checked ? colors.accent : 'transparent' }]}>
                {checked ? <Text style={styles.check}>✓</Text> : null}
              </View>
              <View style={styles.body}>
                <Text style={[styles.time, { color: colors.textMuted }]}>{act.timeLabel}</Text>
                <Text style={[styles.actTitle, { color: colors.text, textDecorationLine: checked ? 'line-through' : 'none' }]}>
                  {act.title}
                </Text>
                {act.detail ? (
                  <Text style={[styles.detail, { color: colors.textSecondary }]}>{act.detail}</Text>
                ) : null}
              </View>
            </LiquidGlassPressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { fontSize: 17, fontWeight: '700' },
  source: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  route: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  progress: { fontSize: 16, fontWeight: '800' },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  rowInner: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#041018', fontSize: 14, fontWeight: '900' },
  body: { flex: 1, gap: 2 },
  time: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  actTitle: { fontSize: 16, fontWeight: '600' },
  detail: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  bulletCol: { width: 16, paddingTop: 2 },
  bullet: { fontSize: 18, fontWeight: '700' },
});
