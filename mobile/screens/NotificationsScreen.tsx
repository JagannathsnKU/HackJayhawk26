import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { companionLaneLabel, type AppNotification } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { DrillDownModal } from '../components/DrillDownModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type Filter = 'all' | 'insights' | 'trip';

export function NotificationsScreen({}: Props) {
  const colors = useAppTheme();
  const { notifications } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<AppNotification | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'insights') return notifications.filter((n) => n.lane);
    if (filter === 'trip') return notifications.filter((n) => !n.lane);
    return notifications;
  }, [notifications, filter]);

  return (
    <View style={[styles.root, { backgroundColor: 'transparent' }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Pick a tile — details open in a focused view instead of an endless feed.
        </Text>

        <View style={styles.filterRow}>
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'insights' as const, label: 'Insights' },
              { id: 'trip' as const, label: 'Trip' },
            ] as const
          ).map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.id ? colors.accentMuted : colors.surfaceElevated,
                  borderColor: filter === f.id ? colors.accent : colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.id }}
            >
              <Text style={[styles.filterLabel, { color: filter === f.id ? colors.accent : colors.textMuted }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          {filtered.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => setSelected(n)}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: colors.surface,
                  borderColor: n.read ? colors.border : colors.accent,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              {n.lane ? (
                <View style={[styles.tileTag, { backgroundColor: colors.accentMuted }]}>
                  <Text style={[styles.tileTagText, { color: colors.accent }]}>
                    {companionLaneLabel(n.lane)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.tileTagPlain, { color: colors.textMuted }]}>Update</Text>
              )}
              <Text style={[styles.tileTitle, { color: colors.text }]} numberOfLines={3}>
                {n.title}
              </Text>
              <Text style={[styles.tileTime, { color: colors.textMuted }]}>{n.timeLabel}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <DrillDownModal
        visible={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={selected?.timeLabel}
      >
        {selected?.lane ? (
          <Text style={[styles.modalTag, { color: colors.accent }]}>{companionLaneLabel(selected.lane)}</Text>
        ) : null}
        <Text style={[styles.modalBody, { color: colors.textSecondary }]}>{selected?.body}</Text>
      </DrillDownModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterLabel: { fontSize: 13, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    minHeight: 128,
    maxWidth: '48%',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  tileTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  tileTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  tileTagPlain: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tileTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20, flex: 1 },
  tileTime: { fontSize: 12, fontWeight: '600' },
  modalTag: { fontSize: 12, fontWeight: '700', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  modalBody: { fontSize: 16, lineHeight: 24 },
});
