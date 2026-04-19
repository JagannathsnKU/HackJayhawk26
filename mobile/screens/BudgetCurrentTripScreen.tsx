import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { Card } from '../components/Card';
import { MiniPieChart } from '../components/MiniPieChart';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetCurrentTrip'>;

export function BudgetCurrentTripScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { services, trip } = useAppState();
  const [budget, setBudget] = useState<{ dailyLimitUsd: number; spentTodayUsd: number } | null>(null);

  useEffect(() => {
    void (async () => {
      setBudget(await services.payment.checkBudget());
    })();
  }, [services.payment]);

  const slices = [
    { label: 'Air', value: 1180, color: '#38bdf8' },
    { label: 'Hotel', value: 220, color: '#a78bfa' },
    { label: 'Meals', value: 128, color: '#f472b6' },
    { label: 'Other', value: 70, color: '#94a3b8' },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.title, { color: colors.text }]}>Trip budget</Text>

      {budget && trip ? (
        <Card>
          <ProgressBar current={budget.spentTodayUsd} max={trip.dailyBudgetUsd} label="Today vs cap" />
        </Card>
      ) : null}

      <Card>
        <MiniPieChart title="Spend mix (mock)" slices={slices} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.shellTitle, { color: colors.text }]}>Verify before pay (UI)</Text>
        <Text style={[styles.shellBody, { color: colors.textSecondary }]}>Hook checks before spend (demo).</Text>
        <PrimaryButton
          title="Simulate verify-before-pay"
          onPress={() =>
            navigation.navigate('PaymentApproval', {
              title: 'Policy-gated spend',
              amountUsd: 180,
              policyState: 'requires_approval',
            })
          }
        />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.shellTitle, { color: colors.text }]}>XRPL FX · XLS-30 (UI)</Text>
        <Text style={[styles.shellBody, { color: colors.textSecondary }]}>
          Watches RLUSD vs destination FX; AMM pre-buy is a shell — not wired up.
        </Text>
        <View style={[styles.fakeGraph, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>JPY leg · illustrative</Text>
          <View style={[styles.bar, { backgroundColor: colors.accentMuted }]}>
            <View style={[styles.barFill, { width: '58%', backgroundColor: colors.accent }]} />
          </View>
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SecondaryButton title="Expenses" onPress={() => navigation.navigate('Expenses')} />
        <SecondaryButton title="Treasury hook history" onPress={() => navigation.navigate('Transactions')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800' },
  shellTitle: { fontSize: 15, fontWeight: '800' },
  shellBody: { fontSize: 13, lineHeight: 19 },
  fakeGraph: { marginTop: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: spacing.md, gap: 8 },
  bar: { height: 10, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
});
