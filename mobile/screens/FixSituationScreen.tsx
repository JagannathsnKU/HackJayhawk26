import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { AssistantSuggestion, IssueCategory } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { backendFetch } from '../services/apiClient';

type Props = NativeStackScreenProps<RootStackParamList, 'FixSituation'>;

type Step = 'choose' | 'suggestions';

const ISSUES: { cat: IssueCategory; glyph: string; title: string; sub: string; accent?: boolean }[] = [
  { cat: 'flight', glyph: '✈', title: 'Flight', sub: 'Delays, seats, rebooking' },
  { cat: 'hotel', glyph: '⌂', title: 'Hotel', sub: 'Check-in, room, billing' },
  { cat: 'general', glyph: '?', title: 'Something else', sub: 'Policy, receipts, routing' },
  { cat: 'emergency', glyph: '!', title: 'Emergency', sub: 'Vault draw access', accent: true },
];

export function FixSituationScreen({ navigation, route }: Props) {
  const colors = useAppTheme();
  const { services } = useAppState();

  const [step, setStep] = useState<Step>('choose');
  const [issue, setIssue] = useState<IssueCategory | null>(null);
  const [message, setMessage] = useState<string>('');
  const [options, setOptions] = useState<AssistantSuggestion[]>([]);
  const [compareVisible, setCompareVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  // XLS-66 emergency loan state
  const [loanBusy, setLoanBusy] = useState(false);
  const [loanResult, setLoanResult] = useState<{ ok: boolean; message: string; txHash?: string } | null>(null);

  const startResolution = async (cat: IssueCategory) => {
    setBusy(true);
    setIssue(cat);
    setLoanResult(null);
    try {
      const res = await services.assistant.resolveIssue(cat);
      setMessage(res.message);
      setOptions(res.suggestions);
      setStep('suggestions');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (route.params?.focus === 'emergency') {
      void startResolution('emergency');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot from route on open
  }, [route.params?.focus]);

  // XLS-66: real emergency LoanSet transaction on XRPL
  const requestVaultDraw = async () => {
    setLoanBusy(true);
    setLoanResult(null);
    try {
      const res = await backendFetch('/agent/emergency-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_broker_id: 'rDefaultBroker',
          principal_requested_drops: '50000000',
          payment_interval: 86400,
          payment_total: 52500000,
          grace_period: 3600,
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (data.ok) {
        const txHash = data.tx_hash as string;
        setLoanResult({
          ok: true,
          message: (data.message as string) ?? 'Emergency funds secured.',
          txHash,
        });
        Alert.alert(
          'XLS-66 LoanSet confirmed',
          `Emergency funds secured on XRPL.\n\nTx: ${txHash.slice(0, 16)}…`,
        );
      } else {
        const explanation = (data.hook_explanation as string) ?? (data.engine_result as string) ?? 'Transaction blocked.';
        setLoanResult({ ok: false, message: explanation });
        Alert.alert('Blocked by hook', explanation);
      }
    } catch {
      setLoanResult({ ok: false, message: 'Could not reach backend. Make sure the server is running.' });
      Alert.alert('Nexus', 'Could not reach backend. Make sure the server is running.');
    } finally {
      setLoanBusy(false);
    }
  };

  const accept = (s: AssistantSuggestion) => {
    navigation.navigate('PaymentApproval', {
      title: s.title,
      amountUsd: s.priceUsd ?? 240,
      policyState: 'within_policy',
    });
  };

  const reset = () => {
    setStep('choose');
    setIssue(null);
    setMessage('');
    setOptions([]);
    setLoanResult(null);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }} contentContainerStyle={styles.body}>
      {step === 'choose' ? (
        <>
          <SectionHeader title="What is wrong?" subtitle="Pick the closest issue type." />
          <Text style={[styles.lede, { color: colors.textSecondary }]}>Choose one lane to see suggested next steps.</Text>

          <View style={styles.issueGrid}>
            {ISSUES.map((it) => (
              <LiquidGlassPressable
                key={it.cat}
                onPress={() => void startResolution(it.cat)}
                variant={it.accent ? 'tileAccent' : 'tile'}
                minHeight={108}
                pressableStyle={styles.issuePress}
                innerStyle={styles.issueInner}
              >
                <Text style={[styles.issueGlyph, { color: colors.accent }]}>{it.glyph}</Text>
                <Text style={[styles.issueLabel, { color: colors.text }]}>{it.title}</Text>
                <Text style={[styles.issueSub, { color: colors.textMuted }]}>{it.sub}</Text>
              </LiquidGlassPressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.suggestHeader}>
            <SectionHeader title="Suggested next steps" subtitle="Assistant suggestions for this situation." />
            <SecondaryButton title="Start over" onPress={reset} />
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={[styles.ai, { color: colors.text }]}>{message}</Text>

            {issue === 'emergency' ? (
              <View style={[styles.emergencyBlock, { borderColor: colors.border }]}>
                <Text style={[styles.emergencyEyebrow, { color: colors.textMuted }]}>Emergency · Vault access</Text>
                <Text style={[styles.emergencyHeadline, { color: colors.text }]}>Short-term flash borrow (XLS-66)</Text>
                <Text style={[styles.emergencyCopy, { color: colors.textSecondary }]}>
                  If you are stranded or out of funds, the system requests a temporary on-chain liquidity advance.
                  Funds are released only after a travel-risk and intent check are verified on the XRPL Lending Devnet.
                </Text>

                {loanResult ? (
                  <View style={[styles.loanResult, { borderColor: loanResult.ok ? colors.success : colors.danger }]}>
                    <Text style={[styles.loanResultText, { color: loanResult.ok ? colors.success : colors.danger }]}>
                      {loanResult.ok ? '✓ ' : '✗ '}{loanResult.message}
                    </Text>
                    {loanResult.txHash ? (
                      <Text style={[styles.loanTxHash, { color: colors.textMuted }]} selectable>
                        Tx: {loanResult.txHash.slice(0, 20)}…
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <PrimaryButton
                  title={loanBusy ? 'Submitting XLS-66…' : loanResult?.ok ? 'Draw again' : 'Request vault draw'}
                  onPress={() => void requestVaultDraw()}
                  loading={loanBusy}
                />
              </View>
            ) : null}
          </Card>

          {issue !== 'emergency' ? (
            <View style={styles.optionList}>
              {options.map((s) => (
                <Card key={s.id} style={styles.optionCard}>
                  <Text style={[styles.optTitle, { color: colors.text }]}>{s.title}</Text>
                  <Text style={[styles.optBody, { color: colors.textSecondary }]}>{s.summary}</Text>
                  <View style={styles.optRow}>
                    <PrimaryButton title="Accept" onPress={() => accept(s)} />
                    <SecondaryButton title="Compare" onPress={() => setCompareVisible(true)} />
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      )}

      <Modal visible={compareVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Compare options</Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              Side-by-side comparison will connect to live shopping later.
            </Text>

            <View style={styles.compareCols}>
              {options.slice(0, 2).map((s) => (
                <View key={s.id} style={[styles.col, { borderColor: colors.border }]}>
                  <Text style={[styles.colTitle, { color: colors.text }]}>{s.title}</Text>
                  <Text style={[styles.colMeta, { color: colors.textMuted }]}>
                    {s.priceUsd != null ? `$${s.priceUsd}` : '—'}
                  </Text>
                  <Text style={[styles.colBody, { color: colors.textSecondary }]}>{s.summary}</Text>
                </View>
              ))}
            </View>

            <PrimaryButton title="Close" onPress={() => setCompareVisible(false)} />
          </View>
        </View>
      </Modal>

      {busy ? <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>Thinking…</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  lede: { fontSize: 14, lineHeight: 20 },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  issuePress: { width: '48%' },
  issueInner: {
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: 6,
  },
  issueGlyph: { fontSize: 26, fontWeight: '600' },
  issueLabel: { fontSize: 16, fontWeight: '800' },
  issueSub: { fontSize: 13, lineHeight: 18 },
  suggestHeader: { gap: spacing.sm },
  emergencyBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emergencyEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  emergencyHeadline: { fontSize: 17, fontWeight: '800' },
  emergencyCopy: { fontSize: 14, lineHeight: 20 },
  loanResult: {
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  loanResultText: { fontSize: 14, fontWeight: '700' },
  loanTxHash: { fontSize: 11, fontFamily: 'monospace' },
  ai: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  optionList: { gap: spacing.md },
  optionCard: { gap: spacing.sm },
  optTitle: { fontSize: 17, fontWeight: '700' },
  optBody: { fontSize: 15, lineHeight: 22 },
  optRow: { gap: spacing.sm, marginTop: spacing.sm },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  modalCard: {
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalBody: { fontSize: 15, lineHeight: 22 },
  compareCols: { flexDirection: 'row', gap: spacing.sm },
  col: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: spacing.sm,
    gap: 6,
  },
  colTitle: { fontSize: 14, fontWeight: '700' },
  colMeta: { fontSize: 13, fontWeight: '600' },
  colBody: { fontSize: 12, lineHeight: 16 },
});
