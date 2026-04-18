import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import type { HookDecision, HookTransactionEvent } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { radii, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = MainTabScreenProps<'TransactionsTab'>;

export function TransactionsScreen({}: Props) {
  const colors = useAppTheme();
  const { hookEvents } = useAppState();
  const [openId, setOpenId] = useState<string | null>(hookEvents[0]?.id ?? null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Enforcement layer</Text>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Treasury hook runs before settlement: merchant class, companion authorization, and trip escrow are checked
          on-ledger (demo scenarios below).
        </Text>

        <View style={styles.section}>
          <SectionHeader title="Hook evaluations" subtitle="Expand a row to see pass/fail checks." />
          {hookEvents.map((ev) => (
            <HookCard
              key={ev.id}
              ev={ev}
              expanded={openId === ev.id}
              onToggle={() => toggle(ev.id)}
              colors={colors}
            />
          ))}
        </View>

        <Card style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Scenario guide</Text>
          <Text style={[styles.legendBody, { color: colors.textSecondary }]}>
            • Passed: all checks green — RLUSD moves from escrow / treasury as policy allows.{'\n'}
            • Blocked: hook rejects (e.g. unknown vendor) — spend never finalizes.{'\n'}
            • Pending: needs companion proof of intent or policy approval (e.g. upgrade over cap).
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function HookCard({
  ev,
  expanded,
  onToggle,
  colors,
}: {
  ev: HookTransactionEvent;
  expanded: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useAppTheme>;
}) {
  return (
    <Card padded={false} style={styles.card}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }}>
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <DecisionPill decision={ev.decision} colors={colors} />
            <Text style={[styles.merchant, { color: colors.text }]}>{ev.merchant}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {categoryLabel(ev.category)} · ${ev.amountUsd.toLocaleString()}
              {ev.reference ? ` · ${ev.reference}` : ''}
            </Text>
          </View>
          <Text style={[styles.chev, { color: colors.textMuted }]}>{expanded ? '−' : '+'}</Text>
        </View>
      </Pressable>
      {expanded ? (
        <View style={[styles.checks, { borderTopColor: colors.border }]}>
          <Text style={[styles.checksKicker, { color: colors.textMuted }]}>Hook checks</Text>
          {ev.hookChecks.map((c) => (
            <View key={c.id} style={styles.checkRow}>
              <Text style={[styles.checkIcon, { color: c.ok ? colors.success : colors.danger }]}>{c.ok ? '✓' : '✗'}</Text>
              <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>{c.label}</Text>
            </View>
          ))}
          <View style={styles.checkRow}>
            <Text style={[styles.checkIcon, { color: ev.companionAuthorized ? colors.success : colors.warning }]}>
              {ev.companionAuthorized ? '✓' : '!'}
            </Text>
            <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>
              Companion agent authorized for this spend
            </Text>
          </View>
          <Text style={[styles.time, { color: colors.textMuted }]}>{ev.timeLabel}</Text>
        </View>
      ) : null}
    </Card>
  );
}

function DecisionPill({ decision, colors }: { decision: HookDecision; colors: ReturnType<typeof useAppTheme> }) {
  const { bg, fg, label } = decisionStyle(decision, colors);
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

function decisionStyle(decision: HookDecision, colors: ReturnType<typeof useAppTheme>) {
  switch (decision) {
    case 'passed':
      return { bg: `${colors.success}22`, fg: colors.success, label: 'Passed' };
    case 'blocked':
      return { bg: `${colors.danger}22`, fg: colors.danger, label: 'Blocked' };
    default:
      return { bg: `${colors.warning}22`, fg: colors.warning, label: 'Pending' };
  }
}

function categoryLabel(c: HookTransactionEvent['category']): string {
  switch (c) {
    case 'airline':
      return 'Airline';
    case 'hotel':
      return 'Hotel';
    case 'ground':
      return 'Ground';
    default:
      return 'Other';
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 4, letterSpacing: -0.4 },
  sub: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  card: { padding: 0, overflow: 'hidden' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.md,
  },
  topLeft: { flex: 1, gap: 6 },
  merchant: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 13, lineHeight: 18 },
  chev: { fontSize: 22, fontWeight: '600', paddingTop: 4 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  checks: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  checksKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkIcon: { fontSize: 16, fontWeight: '700', width: 20 },
  checkLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
  time: { fontSize: 12, fontWeight: '600', marginTop: spacing.xs },
  legend: { marginTop: spacing.lg },
  legendTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  legendBody: { fontSize: 14, lineHeight: 22 },
});
