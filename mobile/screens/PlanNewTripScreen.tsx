import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { HubTile } from '../components/HubTile';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { PrimaryButton } from '../components/PrimaryButton';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanNewTrip'>;

export function PlanNewTripScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          <View style={[styles.banner, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
            <Text style={[styles.bannerText, { color: colors.text }]}>Planning optimized.</Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>Demo — no backend calls.</Text>
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
    gap: 6,
  },
  bannerText: { fontSize: 17, fontWeight: '800' },
  bannerSub: { fontSize: 13, lineHeight: 19 },
  row2: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1, minWidth: 0 },
});
