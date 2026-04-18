import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import type { HookDecision, HookTransactionEvent } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { DrillDownModal } from '../components/DrillDownModal';
import { SectionHeader } from '../components/SectionHeader';

type Props = MainTabScreenProps<'TransactionsTab'>;

type Filter = 'all' | HookDecision;

export function TransactionsScreen({}: Props) {
  const colors = useAppTheme();
  const { hookEvents } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<HookTransactionEvent | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return hookEvents;
    return hookEvents.filter((e) => e.decision === filter);
  }, [hookEvents, filter]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Enforcement layer</Text>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Filter by outcome, then open a case file — hook checks appear in the zoomed panel, not a long accordion.
        </Text>

        <View style={styles.filterRow}>
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'passed' as const, label: 'Passed' },
              { id: 'blocked' as const, label: 'Blocked' },
              { id: 'pending' as const, label: 'Pending' },
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

        <View style={styles.section}>
          <SectionHeader title="Case files" subtitle="One line per spend — tap for hook trace." />
          {filtered.map((ev) => (
            <Pressable
              key={ev.id}
              onPress={() => setDetail(ev)}
              style={({ pressed }) => [
                styles.compactRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              <View style={styles.compactLeft}>
                <DecisionDot decision={ev.decision} colors={colors} />
                <View style={styles.compactText}>
                  <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
                    {ev.merchant}
                  </Text>
                  <Text style={[styles.compactMeta, { color: colors.textMuted }]} numberOfLines={1}>
                    ${ev.amountUsd.toLocaleString()} · {ev.reference ?? ev.timeLabel}
                  </Text>
                </View>
              </View>
              <Text style={[styles.chev, { color: colors.textMuted }]}>→</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Scenario guide</Text>
          <Text style={[styles.legendBody, { color: colors.textSecondary }]}>
            Passed: policy satisfied on-ledger. Blocked: spend never settles. Pending: needs policy approval or signed authorization.
          </Text>
        </Card>
      </ScrollView>

      <DrillDownModal
        visible={detail != null}
        onClose={() => setDetail(null)}
        title={detail?.merchant ?? ''}
        subtitle={detail ? `${detail.decision.toUpperCase()} · ${detail.reference ?? detail.timeLabel}` : undefined}
      >
        {detail ? (
          <>
            <Text style={[styles.modalMeta, { color: colors.textSecondary }]}>
              Category: {detail.category} · ${detail.amountUsd.toLocaleString()}
            </Text>
            <Text style={[styles.modalSection, { color: colors.textMuted }]}>Hook checks</Text>
            {detail.hookChecks.map((c) => (
              <View key={c.id} style={styles.checkRow}>
                <Text style={[styles.checkIcon, { color: c.ok ? colors.success : colors.danger }]}>{c.ok ? '✓' : '✗'}</Text>
                <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>{c.label}</Text>
              </View>
            ))}
            <View style={styles.checkRow}>
              <Text style={[styles.checkIcon, { color: detail.companionAuthorized ? colors.success : colors.warning }]}>
                {detail.companionAuthorized ? '✓' : '!'}
              </Text>
              <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>Authorized for this trip</Text>
            </View>
          </>
        ) : null}
      </DrillDownModal>
    </SafeAreaView>
  );
}

function DecisionDot({ decision, colors }: { decision: HookDecision; colors: ReturnType<typeof useAppTheme> }) {
  const bg =
    decision === 'passed' ? colors.success : decision === 'blocked' ? colors.danger : colors.warning;
  return <View style={[styles.dot, { backgroundColor: bg }]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 4, letterSpacing: -0.4 },
  sub: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterLabel: { fontSize: 13, fontWeight: '700' },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  compactLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  compactText: { flex: 1, gap: 2 },
  compactTitle: { fontSize: 16, fontWeight: '700' },
  compactMeta: { fontSize: 13 },
  chev: { fontSize: 18, fontWeight: '600' },
  legend: { marginTop: spacing.lg },
  legendTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  legendBody: { fontSize: 14, lineHeight: 22 },
  modalMeta: { fontSize: 15, marginBottom: spacing.md },
  modalSection: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  checkIcon: { fontSize: 16, fontWeight: '700', width: 20 },
  checkLabel: { flex: 1, fontSize: 15, lineHeight: 22 },
});
