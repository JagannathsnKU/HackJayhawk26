import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  POLICY_UI_DISCLAIMER,
  approvalGuide,
  officialDocument,
  policyPillars,
  privacyAndSecurity,
  programSummary,
} from '../policy/locktonTravelProgram';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelPolicy'>;

export function TravelPolicyScreen({}: Props) {
  const colors = useAppTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
    >
      <Card style={{ borderColor: colors.warning, borderWidth: StyleSheet.hairlineWidth }}>
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{POLICY_UI_DISCLAIMER}</Text>
      </Card>

      <SectionHeader title={programSummary.headline} subtitle={officialDocument.whereToFind} />
      <Card>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{officialDocument.title}</Text>
        <Text style={[styles.metaSmall, { color: colors.textMuted }]}>{officialDocument.lastUpdatedDisplay}</Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          {programSummary.body}
        </Text>
      </Card>

      <SectionHeader title="At a glance" subtitle="Plain language — always verify against your official document." />
      {policyPillars.map((p) => (
        <Card key={p.id} style={styles.pillar}>
          <Text style={[styles.pillarTitle, { color: colors.text }]}>{p.title}</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{p.body}</Text>
        </Card>
      ))}

      <SectionHeader title={approvalGuide.title} />
      <Card>
        {approvalGuide.steps.map((s, i) => (
          <Text key={i} style={[styles.step, { color: colors.textSecondary }]}>
            {i + 1}. {s}
          </Text>
        ))}
      </Card>

      <SectionHeader title={privacyAndSecurity.title} />
      <Card>
        {privacyAndSecurity.bullets.map((b) => (
          <Text key={b} style={[styles.bullet, { color: colors.textSecondary }]}>
            • {b}
          </Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  disclaimer: { fontSize: 13, lineHeight: 18 },
  meta: { fontSize: 14, fontWeight: '700' },
  metaSmall: { fontSize: 13, marginTop: 4 },
  bodyText: { fontSize: 15, lineHeight: 22 },
  pillar: { gap: spacing.sm },
  pillarTitle: { fontSize: 16, fontWeight: '700' },
  step: { fontSize: 15, lineHeight: 24, marginBottom: spacing.sm },
  bullet: { fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
});
