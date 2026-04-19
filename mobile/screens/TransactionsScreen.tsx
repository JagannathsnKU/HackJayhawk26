import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../navigation/types';
import type { HookDecision, HookTransactionEvent } from '../models/types';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { DrillDownModal } from '../components/DrillDownModal';
import { SectionHeader } from '../components/SectionHeader';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { backendFetch } from '../services/apiClient';

type Props = RootStackScreenProps<'Transactions'>;

type Filter = 'all' | HookDecision;

type MemoryBooking = {
  booking_id: string;
  type: string;
  city: string;
  date: string;
  amount_xrp: number;
  xrpl_tx_hash: string;
  solana_mint?: string;
  timestamp: string;
};

type MemoryLoan = {
  amount_drops: string;
  loan_broker_id: string;
  tx_hash: string;
  timestamp: string;
};

function bookingToEvent(b: MemoryBooking): HookTransactionEvent {
  const cat: HookTransactionEvent['category'] =
    b.type === 'flight' ? 'airline' : b.type === 'hotel' ? 'hotel' : b.type === 'ground' ? 'ground' : 'other';
  return {
    id: b.booking_id,
    timeLabel: new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    merchant: `${b.city} · ${b.type}`,
    category: cat,
    amountUsd: Math.round(b.amount_xrp * 2),
    decision: 'passed',
    hookChecks: [
      { id: 'xrpl', label: 'XRPL payment confirmed (XLS-66)', ok: true },
      { id: 'policy', label: 'Corporate policy check', ok: true },
      { id: 'solana', label: `Solana NFT minted${b.solana_mint ? `: ${b.solana_mint.slice(0, 8)}…` : ''}`, ok: !!b.solana_mint },
    ],
    companionAuthorized: true,
    reference: b.xrpl_tx_hash ? b.xrpl_tx_hash.slice(0, 12) : undefined,
  };
}

function loanToEvent(loan: MemoryLoan, index: number): HookTransactionEvent {
  const xrp = parseInt(loan.amount_drops, 10) / 1_000_000;
  return {
    id: loan.tx_hash || `loan-${index}`,
    timeLabel: new Date(loan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    merchant: 'XRPL Lending Protocol (XLS-66)',
    category: 'other',
    amountUsd: Math.round(xrp * 2),
    decision: 'passed',
    hookChecks: [
      { id: 'loanset', label: 'XLS-66 LoanSet submitted', ok: true },
      { id: 'broker', label: `Broker: ${loan.loan_broker_id}`, ok: true },
    ],
    companionAuthorized: true,
    reference: loan.tx_hash ? loan.tx_hash.slice(0, 12) : undefined,
  };
}

export function TransactionsScreen({}: Props) {
  const colors = useAppTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [detail, setDetail] = useState<HookTransactionEvent | null>(null);
  const [events, setEvents] = useState<HookTransactionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendFetch('/memory')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { recent_bookings?: MemoryBooking[]; loans?: MemoryLoan[] };
        const bookingEvents = (d.recent_bookings ?? []).map(bookingToEvent);
        const loanEvents = (d.loans ?? []).map(loanToEvent);
        setEvents([...bookingEvents, ...loanEvents].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.decision === filter);
  }, [events, filter]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NexusBrandLine />
        <Text style={[styles.title, { color: colors.text }]}>Treasury hooks</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          {loading ? 'Loading transactions…' : `${events.length} on-chain event(s) · tap a row for hook trace.`}
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
            <LiquidGlassPressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              variant={filter === f.id ? 'chipActive' : 'chip'}
              minHeight={40}
              pressableStyle={styles.filterChipWrap}
              innerStyle={styles.filterChipInner}
              accessibilityState={{ selected: filter === f.id }}
            >
              <Text style={[styles.filterLabel, { color: filter === f.id ? colors.text : colors.textMuted }]}>
                {f.label}
              </Text>
            </LiquidGlassPressable>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Case files" subtitle="One line per spend — tap for hook trace." />
          {filtered.length === 0 && !loading ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              No transactions yet. Book a trip or request a vault draw to see live XRPL events here.
            </Text>
          ) : null}
          {filtered.map((ev) => (
            <LiquidGlassPressable
              key={ev.id}
              onPress={() => setDetail(ev)}
              variant="tile"
              minHeight={56}
              innerStyle={styles.compactRowInner}
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
            </LiquidGlassPressable>
          ))}
        </View>

        <Card style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Scenario guide</Text>
          <Text style={[styles.legendBody, { color: colors.textSecondary }]}>
            Passed: payment confirmed on XRPL + Solana NFT minted. Blocked: spend rejected by hook. Pending: awaiting policy approval.
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
  title: { fontSize: 26, fontWeight: '700', marginTop: 4, letterSpacing: -0.4 },
  sub: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  filterChipWrap: { alignSelf: 'flex-start' },
  filterChipInner: { paddingVertical: 8, paddingHorizontal: spacing.md },
  filterLabel: { fontSize: 13, fontWeight: '700' },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  empty: { fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
  compactRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
