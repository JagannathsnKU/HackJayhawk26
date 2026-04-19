import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { companionLaneLabel } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { HubTile } from '../components/HubTile';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';

type Props = NativeStackScreenProps<RootStackParamList, 'CurrentTrip'>;

export function CurrentTripScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { trip, loading, notifications } = useAppState();
  const scans = notifications.filter((n) => n.lane).slice(0, 6);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NexusBrandLine />
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Current trip</Text>
        {loading || !trip ? (
          <Text style={{ color: colors.textSecondary }}>Loading…</Text>
        ) : (
          <Card style={{ gap: spacing.sm }}>
            <Text style={[styles.destTitle, { color: colors.text }]}>
              {trip.destination} · {trip.destinationCode}
            </Text>
            <View style={styles.heroRow}>
              <StatusBadge variant="trip" value={trip.health} />
              <Text style={[styles.approved, { color: colors.success }]}>{trip.approvalStatus}</Text>
            </View>
          </Card>
        )}

        <Text style={[styles.section, { color: colors.textMuted }]}>Updates</Text>
        <Text style={[styles.scanHint, { color: colors.textSecondary }]}>
          Nexus would watch flight disruption feeds, geopolitical risk APIs, and fare drops (not connected in this demo).
        </Text>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {scans.length === 0 ? (
            <Card>
              <Text style={{ color: colors.textSecondary }}>No signals yet.</Text>
            </Card>
          ) : (
            scans.map((n) => (
              <LiquidGlassPressable
                key={n.id}
                onPress={() => navigation.navigate('Notifications')}
                variant="tile"
                minHeight={120}
                pressableStyle={styles.insightWrap}
                innerStyle={styles.insightInner}
              >
                {n.lane ? (
                  <Text style={[styles.pill, { color: colors.accent }]}>{companionLaneLabel(n.lane)}</Text>
                ) : null}
                <Text style={[styles.insTitle, { color: colors.text }]} numberOfLines={2}>
                  {n.title}
                </Text>
                <Text style={[styles.insBody, { color: colors.textSecondary }]} numberOfLines={2}>
                  {n.body}
                </Text>
              </LiquidGlassPressable>
            ))
          )}
        </ScrollView>
        <SecondaryButton title="All updates" onPress={() => navigation.navigate('Notifications')} />

        <Text style={[styles.section, { color: colors.textMuted }]}>Trip tools</Text>
        <View style={styles.grid}>
          <HubTile title="Bookings" subtitle="Confirmations" icon="▤" onPress={() => navigation.navigate('CurrentBookings')} />
          <HubTile title="Budget" subtitle="Spend & treasury" icon="◈" onPress={() => navigation.navigate('BudgetCurrentTrip')} />
          <HubTile title="Meetings" subtitle="Schedule" icon="◉" onPress={() => navigation.navigate('CurrentMeetings')} />
          <HubTile title="Food" subtitle="Nearby" icon="◆" onPress={() => navigation.navigate('FoodDiscover')} />
        </View>

        <HubTile
          title="Navigation"
          subtitle="Routes"
          icon="⎈"
          variant="accent"
          onPress={() => navigation.navigate('TravelRouting')}
        />

        <PrimaryButton title="Fix my situation" onPress={() => navigation.navigate('FixSituation')} />
        <SecondaryButton title="Help" onPress={() => navigation.navigate('HelpInsurance')} />
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
    gap: spacing.md,
  },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  destTitle: { fontSize: 22, fontWeight: '800' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  approved: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: spacing.sm },
  scanHint: { fontSize: 13, lineHeight: 19 },
  carousel: { gap: spacing.sm, paddingVertical: 4 },
  insightWrap: { width: 240 },
  insightInner: {
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: 6,
  },
  pill: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  insTitle: { fontSize: 15, fontWeight: '700' },
  insBody: { fontSize: 13, lineHeight: 18 },
  grid: { gap: spacing.sm },
});
