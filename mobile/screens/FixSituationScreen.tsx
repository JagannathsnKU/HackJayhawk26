import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { AssistantSuggestion, IssueCategory } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'FixSituation'>;

type Step = 'choose' | 'suggestions';

export function FixSituationScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { services } = useAppState();

  const [step, setStep] = useState<Step>('choose');
  const [issue, setIssue] = useState<IssueCategory | null>(null);
  const [message, setMessage] = useState<string>('');
  const [options, setOptions] = useState<AssistantSuggestion[]>([]);
  const [compareVisible, setCompareVisible] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const accept = (s: AssistantSuggestion) => {
    navigation.navigate('PaymentApproval', {
      title: s.title,
      amountUsd: s.priceUsd ?? 240,
      policyState: 'within_policy',
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.body}>
      {step === 'choose' ? (
        <>
          <SectionHeader title="What’s wrong?" subtitle="Pick one — we’ll handle the rest." />
          <Card>
            <Text style={[styles.prompt, { color: colors.textSecondary }]}>
              No need to explain everything. Choose the closest match.
            </Text>
          </Card>

          <View style={styles.issueGrid}>
            <Pressable
              onPress={() => void startResolution('flight')}
              style={({ pressed }) => [
                styles.issueTile,
                { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.issueGlyph, { color: colors.accent }]}>✈</Text>
              <Text style={[styles.issueLabel, { color: colors.text }]}>Flight</Text>
              <Text style={[styles.issueSub, { color: colors.textMuted }]}>Delays, seats, rebooking</Text>
            </Pressable>

            <Pressable
              onPress={() => void startResolution('hotel')}
              style={({ pressed }) => [
                styles.issueTile,
                { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.issueGlyph, { color: colors.accent }]}>⌂</Text>
              <Text style={[styles.issueLabel, { color: colors.text }]}>Hotel</Text>
              <Text style={[styles.issueSub, { color: colors.textMuted }]}>Check-in, room, billing</Text>
            </Pressable>

            <Pressable
              onPress={() => void startResolution('general')}
              style={({ pressed }) => [
                styles.issueTile,
                { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.issueGlyph, { color: colors.accent }]}>?</Text>
              <Text style={[styles.issueLabel, { color: colors.text }]}>Something else</Text>
              <Text style={[styles.issueSub, { color: colors.textMuted }]}>Policy, receipts, routing</Text>
            </Pressable>

            <Pressable
              onPress={() => void startResolution('emergency')}
              style={({ pressed }) => [
                styles.issueTile,
                { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.issueGlyph, { color: colors.accent }]}>!</Text>
              <Text style={[styles.issueLabel, { color: colors.text }]}>Emergency</Text>
              <Text style={[styles.issueSub, { color: colors.textMuted }]}>Vault draw access</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <SectionHeader title="Here’s a calm path forward" subtitle="Mocked assistant response." />

          <Card>
            <Text style={[styles.ai, { color: colors.text }]}>{message}</Text>

            {issue === 'emergency' ? (
              <Card style={styles.emergencyBlock}>
                <Text style={[styles.emergencyEyebrow, { color: colors.textMuted }]}>Emergency · Vault Access</Text>
                <Text style={[styles.emergencyHeadline, { color: colors.text }]}>
                  Short-term Flash Borrow (XLS-66)
                </Text>
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
              </Card>
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
  prompt: { fontSize: 15, lineHeight: 22 },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  issueTile: {
    width: '48%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: spacing.md,
    gap: 6,
    minHeight: 120,
  },
  issueGlyph: { fontSize: 28, fontWeight: '600' },
  issueLabel: { fontSize: 17, fontWeight: '700' },
  issueSub: { fontSize: 13, lineHeight: 18 },
  emergencyBlock: { gap: spacing.sm, marginTop: spacing.sm },
  emergencyEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  emergencyHeadline: { fontSize: 18, fontWeight: '700' },
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