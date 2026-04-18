import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpInsurance'>;

const TOPICS = [
  { id: 'med', label: 'Medical', description: 'Injury, illness, or clinic referral' },
  { id: 'disrupt', label: 'Travel disruption', description: 'Delays, cancellations, missed connections' },
  { id: 'emergency', label: 'Emergency', description: 'Urgent safety or security situations' },
] as const;

export function HelpInsuranceScreen({}: Props) {
  const colors = useAppTheme();
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
    >
      <SectionHeader
        title="You’re covered"
        subtitle="Lockton travel protection for this trip (mock)."
      />
      <Card>
        <Text style={[styles.covered, { color: colors.success }]}>You are covered</Text>
        <Text style={[styles.coveredBody, { color: colors.textSecondary }]}>
          Emergency medical, trip disruption, and security assistance — details will link to your policy PDF in
          production.
        </Text>
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
            <SecondaryButton
              key={t.id}
              title={t.label}
              onPress={() => setSelectedTopic(t.id)}
            />
          ))}
        </View>
      ) : null}

      {TOPICS.map((t) =>
        selectedTopic === t.id ? (
          <Card key={`detail-${t.id}`}>
            <Text style={[styles.topicTitle, { color: colors.text }]}>{t.label}</Text>
            <Text style={[styles.topicBody, { color: colors.textSecondary }]}>{t.description}</Text>
            <Text style={[styles.actionsTitle, { color: colors.text }]}>Suggested actions</Text>
            <Text style={[styles.suggestion, { color: colors.textSecondary }]}>
              • Call the 24/7 travel line (mock){'\n'}• Message your trip owner at Lockton{'\n'}• Save receipts for
              any out-of-pocket costs
            </Text>
          </Card>
        ) : null,
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  covered: { fontSize: 16, fontWeight: '700' },
  coveredBody: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  topicList: { gap: spacing.sm },
  topicTitle: { fontSize: 18, fontWeight: '700' },
  topicBody: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  actionsTitle: { fontSize: 14, fontWeight: '700', marginTop: spacing.md },
  suggestion: { fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
});
