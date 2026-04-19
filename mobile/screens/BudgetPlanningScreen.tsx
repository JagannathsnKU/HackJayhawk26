import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { SecondaryButton } from '../components/SecondaryButton';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetPlanning'>;

const CATEGORIES = [
  { id: 'air', label: 'Air', planned: 1400 },
  { id: 'hotel', label: 'Hotel', planned: 900 },
  { id: 'ground', label: 'Ground & meals', planned: 420 },
];

export function BudgetPlanningScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { services, trip } = useAppState();
  const [limits, setLimits] = useState<{ hotelPerNightUsd: number; mealPerDayUsd: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const l = await services.policy.getLimits();
      setLimits(l);
    })();
  }, [services.policy]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.title, { color: colors.text }]}>Budget</Text>

      {trip ? (
        <Card>
          <ProgressBar current={0} max={trip.dailyBudgetUsd} label="Daily allocation" />
        </Card>
      ) : null}

      {CATEGORIES.map((c) => (
        <Card key={c.id}>
          <Text style={[styles.catTitle, { color: colors.text }]}>{c.label}</Text>
          <Text style={[styles.amt, { color: colors.accent }]}>${c.planned.toLocaleString()}</Text>
        </Card>
      ))}

      {limits ? (
        <Card style={{ gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Caps</Text>
          <Text style={{ color: colors.text }}>Hotel ${limits.hotelPerNightUsd}/night · Meals ${limits.mealPerDayUsd}/day</Text>
        </Card>
      ) : null}

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.shellTitle, { color: colors.text }]}>XRPL FX (UI)</Text>
        <Text style={[styles.shellBody, { color: colors.textSecondary }]}>
          Rate watch + XLS-30 pre-buy placeholder — not executed here.
        </Text>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.shellTitle, { color: colors.text }]}>Treasury hooks</Text>
        <Text style={[styles.shellBody, { color: colors.textSecondary }]}>Spend history with budget.</Text>
        <SecondaryButton title="Hook transaction history" onPress={() => navigation.navigate('Transactions')} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800' },
  catTitle: { fontSize: 16, fontWeight: '800' },
  amt: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  shellTitle: { fontSize: 15, fontWeight: '800' },
  shellBody: { fontSize: 13, lineHeight: 19 },
});
