import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { HubTile } from '../components/HubTile';
import { MiniPieChart } from '../components/MiniPieChart';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { PrimaryButton } from '../components/PrimaryButton';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { PLAN_OPTIMIZED_LINES, PLAN_OPTIMIZED_PIE_SLICES } from '../utils/planOptimizedSummary';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanNewTrip'>;

const PIE_SIZE = 96;

export function PlanNewTripScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pieSlices = useMemo(() => [...PLAN_OPTIMIZED_PIE_SLICES], []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const optimizeAll = () => {
    if (optimizing || optimized) return;
    setOptimizing(true);
    setOptimized(false);
    timerRef.current = setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
      timerRef.current = null;
    }, 900);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NexusBrandLine />
        <Text style={[styles.title, { color: colors.text }]}>Plan trip</Text>

        <PrimaryButton title="Optimize everything" onPress={optimizeAll} loading={optimizing} disabled={optimized} />

        {optimized ? (
          <View style={{ gap: spacing.md }}>
            <View style={[styles.banner, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
              <Text style={[styles.bannerText, { color: colors.text }]}>Planning optimized</Text>
              <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                Estimates vs policy caps — tap tiles below to adjust.
              </Text>
            </View>

            <Card style={styles.snapshotCard}>
              <View style={styles.snapshotTop}>
                <View style={styles.pieShell}>
                  <MiniPieChart title="" slices={pieSlices} size={PIE_SIZE} />
                </View>
                <View style={styles.pieCaption}>
                  <Text style={[styles.pieCaptionTitle, { color: colors.text }]}>Spend mix</Text>
                  <Text style={[styles.pieCaptionSub, { color: colors.textMuted }]}>By category</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {PLAN_OPTIMIZED_LINES.map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <Text style={[styles.lineLabel, { color: colors.text }]}>{line.label}</Text>
                    <Text style={[styles.linePolicy, { color: colors.textMuted }]}>{line.policyHint}</Text>
                  </View>
                  <Text style={[styles.lineCost, { color: colors.accent }]}>{line.cost}</Text>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <View style={styles.row2}>
          <View style={styles.half}>
            <HubTile title="Booking" icon="✶" compact onPress={() => navigation.navigate('BookingHub')} />
          </View>
          <View style={styles.half}>
            <HubTile title="Budget" icon="◇" compact onPress={() => navigation.navigate('BudgetPlanning')} />
          </View>
        </View>
        <View style={styles.row2}>
          <View style={styles.half}>
            <HubTile title="Company policy" icon="◎" compact onPress={() => navigation.navigate('CompanyPolicyPlan')} />
          </View>
          <View style={styles.half}>
            <HubTile title="Packing list" icon="☐" compact onPress={() => navigation.navigate('PackingList')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  banner: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: spacing.md,
    gap: 4,
  },
  bannerText: { fontSize: 17, fontWeight: '800' },
  bannerSub: { fontSize: 12, lineHeight: 17 },
  snapshotCard: {
    gap: 0,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  snapshotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pieShell: {
    borderRadius: 12,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pieCaption: { flex: 1, gap: 2 },
  pieCaptionTitle: { fontSize: 15, fontWeight: '800' },
  pieCaptionSub: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  divider: { height: StyleSheet.hairlineWidth * 2, marginVertical: spacing.xs },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  lineLeft: { flex: 1, minWidth: 0, gap: 2 },
  lineLabel: { fontSize: 15, fontWeight: '700' },
  linePolicy: { fontSize: 10, fontWeight: '500', letterSpacing: 0.15, opacity: 0.92 },
  lineCost: { fontSize: 16, fontWeight: '800' },
  row2: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1, minWidth: 0 },
});
