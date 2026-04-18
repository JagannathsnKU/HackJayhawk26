import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { AssistantSuggestion, IssueCategory } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
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
      amountUsd: s.priceUsd ?? null,
      policyState: 'within_policy',
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
    >
      {step === 'choose' ? (
        <>
          <SectionHeader title="What’s wrong?" subtitle="Pick one — we’ll handle the rest." />
          <Card>
            <Text style={[styles.prompt, { color: colors.textSecondary }]}>
              No need to explain everything. Choose the closest match.
            </Text>
          </Card>
          <View style={styles.stack}>
            <SecondaryButton title="Flight issue" onPress={() => void startResolution('flight')} />
            <SecondaryButton title="Hotel issue" onPress={() => void startResolution('hotel')} />
            <SecondaryButton title="General confusion" onPress={() => void startResolution('general')} />
          </View>
        </>
      ) : (
        <>
          <SectionHeader
            title="Here’s a calm path forward"
            subtitle="Guided next steps — confirm any spend in your booking tool."
          />
          <Card>
            <Text style={[styles.ai, { color: colors.text }]}>{message}</Text>
            {issue ? (
              <Text style={[styles.issueTag, { color: colors.textMuted }]}>
                Context:{' '}
                {issue === 'flight' ? 'Flight' : issue === 'hotel' ? 'Hotel' : 'General'}
              </Text>
            ) : null}
          </Card>

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

          <SecondaryButton title="Cancel" onPress={() => navigation.goBack()} />
        </>
      )}

      <Modal visible={compareVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Compare (mock)</Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              Side-by-side comparison will connect to live shopping later. For now, both options keep you within
              typical limits.
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

      {busy ? (
        <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>Thinking…</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  prompt: { fontSize: 15, lineHeight: 22 },
  stack: { gap: spacing.sm },
  ai: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  issueTag: { fontSize: 13, marginTop: spacing.sm },
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
