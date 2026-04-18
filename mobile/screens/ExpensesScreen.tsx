import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

export function ExpensesScreen({}: Props) {
  const colors = useAppTheme();
  const { services, trip } = useAppState();
  const [budget, setBudget] = useState<{ dailyLimitUsd: number; spentTodayUsd: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const b = await services.payment.checkBudget();
      setBudget(b);
    })();
  }, [services.payment]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
    >
      <SectionHeader title="Expenses" subtitle="Today’s spend vs. policy (mock)." />
      {budget && trip ? (
        <Card>
          <ProgressBar current={budget.spentTodayUsd} max={trip.dailyBudgetUsd} label="Daily budget" />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Meals capped at $75/day in policy reference data. Hotel $300/night. This screen is illustrative only.
          </Text>
        </Card>
      ) : null}

      <Card>
        <Text style={[styles.line, { color: colors.text }]}>Ground transport · $42</Text>
        <Text style={[styles.line, { color: colors.text }]}>Airport lounge · $0 (membership)</Text>
        <Text style={[styles.line, { color: colors.text }]}>Team dinner (receipt) · $128</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  note: { fontSize: 13, lineHeight: 18, marginTop: spacing.md },
  line: { fontSize: 15, marginBottom: spacing.sm },
});
