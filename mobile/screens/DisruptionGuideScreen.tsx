import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { disruptionPlaybook, escalationPaths } from '../policy/locktonTravelProgram';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'DisruptionGuide'>;

export function DisruptionGuideScreen({ navigation }: Props) {
  const colors = useAppTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
    >
      <SectionHeader title={disruptionPlaybook.title} subtitle={disruptionPlaybook.intro} />
      <Card>
        {disruptionPlaybook.steps.map((s, i) => (
          <Text key={i} style={[styles.step, { color: colors.textSecondary }]}>
            {i + 1}. {s}
          </Text>
        ))}
      </Card>

      <SectionHeader title="Escalation paths" subtitle="Who to involve when the booking tool is not enough." />
      {escalationPaths.map((e) => (
        <Card key={e.id} style={styles.card}>
          <Text style={[styles.situation, { color: colors.text }]}>{e.situation}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>Next step</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{e.nextStep}</Text>
          <Text style={[styles.label, { color: colors.textMuted, marginTop: spacing.sm }]}>If still stuck</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{e.escalateIf}</Text>
        </Card>
      ))}

      <PrimaryButton title="Open fix my situation" onPress={() => navigation.navigate('FixSituation')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  step: { fontSize: 15, lineHeight: 24, marginBottom: spacing.sm },
  card: { gap: spacing.xs },
  situation: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { fontSize: 14, lineHeight: 21 },
});
