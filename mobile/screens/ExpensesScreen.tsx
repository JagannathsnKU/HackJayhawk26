import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { BudgetSnapshot } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeader } from '../components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

export function ExpensesScreen({}: Props) {
  const colors = useAppTheme();
  const { services, trip } = useAppState();
  const [budget, setBudget] = useState<BudgetSnapshot | null>(null);

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
      <SectionHeader
        title="Expenses"
        subtitle="Illustrative until connected to Concur / card feeds. Caps come from your official policy."
      />
      {budget && trip ? (
        <Card>
          <ProgressBar
            current={budget.spentTodayUsd}
            max={budget.dailyLimitUsd ?? trip.dailyBudgetUsd}
            label="Daily budget"
            captionFallback={budget.limitNote}
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>{trip.budgetNote}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={[styles.line, { color: colors.textSecondary }]}>
          Example line items only — not your real ledger.
        </Text>
        <Text style={[styles.line, { color: colors.text }]}>Ground transport · receipt required if reimbursable</Text>
        <Text style={[styles.line, { color: colors.text }]}>Meals · per policy (per-diem or itemized)</Text>
        <Text style={[styles.line, { color: colors.text }]}>Lodging · match booking tool confirmation</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  note: { fontSize: 13, lineHeight: 18, marginTop: spacing.md },
  line: { fontSize: 15, marginBottom: spacing.sm },
});
