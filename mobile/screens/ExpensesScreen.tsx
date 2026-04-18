import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeader } from '../components/SectionHeader';
import { radii } from '../utils/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

const LINES: { id: string; label: string; amount: string; detail: string }[] = [
  { id: 'g', label: 'Ground', amount: '$42', detail: 'Car to airport · receipt captured' },
  { id: 'l', label: 'Lounge', amount: '$0', detail: 'Membership — no out-of-pocket' },
  { id: 'd', label: 'Dinner', amount: '$128', detail: 'Team dinner · policy meal bucket' },
];

export function ExpensesScreen({}: Props) {
  const colors = useAppTheme();
  const { services, trip } = useAppState();
  const [budget, setBudget] = useState<{ dailyLimitUsd: number; spentTodayUsd: number } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const b = await services.payment.checkBudget();
      setBudget(b);
    })();
  }, [services.payment]);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerPad}>
        <SectionHeader title="Expenses" subtitle="Tap a category — detail expands in place." />
      </View>
      <View style={styles.body}>
        {budget && trip ? (
          <Card>
            <ProgressBar current={budget.spentTodayUsd} max={trip.dailyBudgetUsd} label="Daily budget" />
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Meals capped at $75/day in policy reference. Hotel $300/night. Illustrative only.
            </Text>
          </Card>
        ) : null}

        <View style={styles.tiles}>
          {LINES.map((line) => {
            const expanded = openId === line.id;
            return (
              <Pressable
                key={line.id}
                onPress={() => toggle(line.id)}
                style={[
                  styles.tile,
                  {
                    borderColor: expanded ? colors.accent : colors.border,
                    backgroundColor: expanded ? colors.accentMuted : colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <View style={styles.tileTop}>
                  <Text style={[styles.tileLabel, { color: colors.text }]}>{line.label}</Text>
                  <Text style={[styles.tileAmt, { color: colors.accent }]}>{line.amount}</Text>
                </View>
                {expanded ? (
                  <Text style={[styles.tileDetail, { color: colors.textSecondary }]}>{line.detail}</Text>
                ) : (
                  <Text style={[styles.tilePeek, { color: colors.textMuted }]} numberOfLines={1}>
                    {line.detail}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingTop: spacing.md, paddingBottom: spacing.xl * 2 },
  headerPad: { paddingHorizontal: screenPaddingX },
  body: {
    paddingHorizontal: screenPaddingX,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  note: { fontSize: 13, lineHeight: 18, marginTop: spacing.md },
  tiles: { gap: spacing.sm },
  tile: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tileLabel: { fontSize: 17, fontWeight: '700' },
  tileAmt: { fontSize: 20, fontWeight: '700' },
  tilePeek: { fontSize: 14 },
  tileDetail: { fontSize: 15, lineHeight: 22 },
});
