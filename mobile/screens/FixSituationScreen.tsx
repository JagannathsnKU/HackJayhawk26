import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { AssistantSuggestion, IssueCategory } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

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
  const [twistOn, setTwistOn] = useState(false);

  const startResolution = async (cat: IssueCategory) => {
    setBusy(true);
    setIssue(cat);
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
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }} contentContainerStyle={styles.body}>
      <Card style={[styles.twistCard, { borderColor: colors.accent }]}>
        <View style={styles.twistTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.twistKicker, { color: colors.accent }]}>2026 twist · UI shell only</Text>
            <Text style={[styles.twistTitle, { color: colors.text }]}>Chronos disruption mesh</Text>
            <Text style={[styles.twistBody, { color: colors.textSecondary }]}>
              Proactive rerouting hints would fuse live ops, weather, and treasury posture. No backend calls — this
              toggle is a visual placeholder for the hackathon narrative.
            </Text>
          </View>
          <Switch value={twistOn} onValueChange={setTwistOn} accessibilityLabel="Chronos mesh preview" />
        </View>
        <Text style={[styles.twistFoot, { color: colors.textMuted }]}>
          Status: {twistOn ? 'Preview armed (no signal)' : 'Idle'}
        </Text>
      </Card>

      {step === 'choose' ? (
        <>
          <SectionHeader title="What is wrong?" subtitle="Pick the closest lane — assistant stays mocked." />
          <Text style={[styles.lede, { color: colors.textSecondary }]}>
            Structured triage keeps the page calm: one decision per row, no mixed paragraphs.
          </Text>

          <View style={styles.issueGrid}>
            {ISSUES.map((it) => (
              <Pressable
                key={it.cat}
                onPress={() => void startResolution(it.cat)}
                style={({ pressed }) => [
                  styles.issueTile,
                  {
                    borderColor: it.accent ? colors.accent : colors.border,
                    backgroundColor: it.accent ? colors.accentMuted : colors.surface,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <Text style={[styles.issueGlyph, { color: colors.accent }]}>{it.glyph}</Text>
                <Text style={[styles.issueLabel, { color: colors.text }]}>{it.title}</Text>
                <Text style={[styles.issueSub, { color: colors.textMuted }]}>{it.sub}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.suggestHeader}>
            <SectionHeader title="Calm path forward" subtitle="Mock assistant output." />
            <SecondaryButton title="Start over" onPress={reset} />
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={[styles.ai, { color: colors.text }]}>{message}</Text>

            {issue === 'emergency' ? (
              <View style={[styles.emergencyBlock, { borderColor: colors.border }]}>
                <Text style={[styles.emergencyEyebrow, { color: colors.textMuted }]}>Emergency · Vault access</Text>
                <Text style={[styles.emergencyHeadline, { color: colors.text }]}>Short-term flash borrow (XLS-66)</Text>
                <Text style={[styles.emergencyCopy, { color: colors.textSecondary }]}>
                  If you are stranded or out of funds, the system can request a temporary on-chain liquidity advance.
                  Funds are released only after a travel-risk and intent check are verified.
                </Text>
                <PrimaryButton
                  title="Simulate vault draw"
                  onPress={() =>
                    Alert.alert(
                      'Demo',
                      'A vault draw would be executed with policy checks and auto-repayment on settlement.',
                    )
                  }
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Compare (mock)</Text>
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
  twistCard: { gap: spacing.sm, borderWidth: 2, borderRadius: radii.lg },
  twistTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  twistKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  twistTitle: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  twistBody: { fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  twistFoot: { fontSize: 12, fontWeight: '600' },
  lede: { fontSize: 14, lineHeight: 20 },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  issueTile: {
    width: '48%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 6,
    minHeight: 118,
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
