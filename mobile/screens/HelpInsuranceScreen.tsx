import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { benefitsAndCoverageNote, disruptionPlaybook, escalationPaths } from '../policy/locktonTravelProgram';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpInsurance'>;

const TOPICS = [
  { id: 'med', label: 'Medical', description: 'Injury, illness, or clinic referral while traveling' },
  { id: 'disrupt', label: 'Travel disruption', description: 'Delays, cancellations, missed connections' },
  { id: 'emergency', label: 'Emergency', description: 'Urgent safety or security situations' },
] as const;

export function HelpInsuranceScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
    >
      <SectionHeader title={benefitsAndCoverageNote.title} subtitle="Use your benefits documents for legal terms." />
      <Card>
        <Text style={[styles.coveredBody, { color: colors.textSecondary }]}>{benefitsAndCoverageNote.body}</Text>
      </Card>

      <SectionHeader title="If plans change" subtitle={disruptionPlaybook.intro} />
      <Card>
        {disruptionPlaybook.steps.slice(0, 3).map((s, i) => (
          <Text key={i} style={[styles.step, { color: colors.textSecondary }]}>
            {i + 1}. {s}
          </Text>
        ))}
        <SecondaryButton title="Full disruption guide" onPress={() => navigation.navigate('DisruptionGuide')} />
      </Card>

      <SectionHeader title="Escalation" subtitle="Replace contacts with your published travel / security numbers." />
      <Card>
        {escalationPaths.map((e) => (
          <Text key={e.id} style={[styles.escLine, { color: colors.textSecondary }]}>
            <Text style={{ fontWeight: '700', color: colors.text }}>{e.situation}: </Text>
            {e.nextStep}
          </Text>
        ))}
      </Card>

      <PrimaryButton
        title="I need help"
        onPress={() => {
          setShowTopics(true);
          setSelectedTopic(null);
        }}
      />

      {showTopics ? (
        <View style={styles.topicList}>
          {TOPICS.map((t) => (
            <SecondaryButton key={t.id} title={t.label} onPress={() => setSelectedTopic(t.id)} />
          ))}
        </View>
      ) : null}

      {TOPICS.map((t) =>
        selectedTopic === t.id ? (
          <Card key={`detail-${t.id}`}>
            <Text style={[styles.topicTitle, { color: colors.text }]}>{t.label}</Text>
            <Text style={[styles.topicBody, { color: colors.textSecondary }]}>{t.description}</Text>
            <Text style={[styles.actionsTitle, { color: colors.text }]}>Suggested next steps</Text>
            <Text style={[styles.suggestion, { color: colors.textSecondary }]}>
              • Use the traveler assistance number in your benefits / ID card (not SMS or public social).{'\n'}• Notify
              your manager if work obligations are affected.{'\n'}• Keep receipts and airline / hotel written
              confirmations for any reimbursement or claim.
            </Text>
          </Card>
        ) : null,
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  coveredBody: { fontSize: 15, lineHeight: 22 },
  step: { fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
  escLine: { fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
  topicList: { gap: spacing.sm },
  topicTitle: { fontSize: 18, fontWeight: '700' },
  topicBody: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  actionsTitle: { fontSize: 14, fontWeight: '700', marginTop: spacing.md },
  suggestion: { fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
});
