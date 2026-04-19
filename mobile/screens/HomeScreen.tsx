import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { HubTile } from '../components/HubTile';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { PAST_TRIP_LIST } from '../utils/pastTrips';

type Props = NativeStackScreenProps<RootStackParamList, 'MainHome'>;

export function HomeScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { user, loading, trip } = useAppState();
  const [policyOpen, setPolicyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <View style={styles.homeLayer}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.textMuted }]}>Nexus</Text>
            <Text style={[styles.greet, { color: colors.text }]}>
              {loading || !user ? 'Hello' : `Hi, ${user.displayName.split(' ')[0]}`}
            </Text>
          </View>
          <LiquidGlassPressable
            onPress={() => navigation.navigate('Profile')}
            variant="secondary"
            minHeight={44}
            borderRadius={radii.pill}
            pressableStyle={{ alignSelf: 'flex-start' }}
            innerStyle={styles.accountInner}
          >
            <Text style={[styles.iconPillText, { color: colors.text }]}>Account</Text>
          </LiquidGlassPressable>
        </View>

        <View style={styles.row2}>
          <View style={styles.half}>
            <HubTile title="Plan new trip" icon="＋" variant="accent" compact onPress={() => navigation.navigate('PlanNewTrip')} />
          </View>
          <View style={styles.half}>
            <HubTile title="Current trip" icon="→" compact onPress={() => navigation.navigate('CurrentTrip')} />
          </View>
        </View>

        <View style={styles.expandShell}>
          <LiquidGlassPressable
            onPress={() => setPolicyOpen((o) => !o)}
            variant="tile"
            minHeight={52}
            innerStyle={styles.expandHeadInner}
            pressableStyle={styles.expandHeadPress}
            accessibilityState={{ expanded: policyOpen }}
          >
            <Text style={[styles.expandTitle, { color: colors.text }]}>Travel policy</Text>
            <Text style={[styles.chev, { color: colors.accent }]}>{policyOpen ? '▲' : '▼'}</Text>
          </LiquidGlassPressable>
          {policyOpen ? (
            <View style={[styles.expandBody, { borderTopColor: 'rgba(255,255,255,0.12)' }]}>
              <Pressable
                onPress={() => setPolicyOpen(false)}
                hitSlop={12}
                style={styles.collapseUp}
                accessibilityRole="button"
                accessibilityLabel="Close travel policy"
              >
                <Text style={[styles.collapseUpText, { color: colors.accent }]}>▲ Close</Text>
              </Pressable>
              <Text style={[styles.policyP, { color: colors.textSecondary }]}>
                Economy by default. Business needs approval. Hotel $300/night. Meals $75/day. Approved vendors when strict
                mode is on.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.expandShell}>
          <LiquidGlassPressable
            onPress={() => setHistoryOpen((o) => !o)}
            variant="tile"
            minHeight={52}
            innerStyle={styles.expandHeadInner}
            pressableStyle={styles.expandHeadPress}
            accessibilityState={{ expanded: historyOpen }}
          >
            <Text style={[styles.expandTitle, { color: colors.text }]}>Previous trips</Text>
            <Text style={[styles.chev, { color: colors.accent }]}>{historyOpen ? '▲' : '▼'}</Text>
          </LiquidGlassPressable>
          {historyOpen ? (
            <View style={[styles.expandBody, { borderTopColor: 'rgba(255,255,255,0.12)', gap: spacing.sm }]}>
              <Pressable
                onPress={() => setHistoryOpen(false)}
                hitSlop={12}
                style={styles.collapseUp}
                accessibilityRole="button"
                accessibilityLabel="Close previous trips"
              >
                <Text style={[styles.collapseUpText, { color: colors.accent }]}>▲ Close</Text>
              </Pressable>
              {trip ? (
                <LiquidGlassPressable
                  onPress={() => navigation.navigate('CurrentTrip')}
                  variant="tileAccent"
                  minHeight={72}
                  innerStyle={styles.tripInner}
                >
                  <Text style={[styles.tripMeta, { color: colors.textMuted }]}>Active</Text>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>
                    {trip.destination} · {trip.destinationCode}
                  </Text>
                </LiquidGlassPressable>
              ) : null}
              {PAST_TRIP_LIST.map((p) => (
                <LiquidGlassPressable
                  key={p.id}
                  onPress={() => navigation.navigate('PastTripSummary', { pastTripId: p.id })}
                  variant="tile"
                  minHeight={72}
                  innerStyle={styles.tripInner}
                >
                  <Text style={[styles.tripMeta, { color: colors.textMuted }]}>{p.dateLabel}</Text>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>{p.title}</Text>
                </LiquidGlassPressable>
              ))}
              <LiquidGlassPressable
                onPress={() => navigation.navigate('Badges')}
                variant="secondary"
                minHeight={46}
                pressableStyle={{ alignSelf: 'flex-start' }}
                innerStyle={styles.moreInner}
              >
                <Text style={[styles.moreLinkText, { color: colors.text }]}>Badges</Text>
              </LiquidGlassPressable>
            </View>
          ) : null}
        </View>

        <View style={styles.full}>
          <HubTile title="Badges" icon="★" compact onPress={() => navigation.navigate('Badges')} />
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  homeLayer: { flex: 1, position: 'relative' },
  scroll: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2 + 72,
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  greet: { fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.4 },
  row2: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1, minWidth: 0 },
  full: { width: '100%' },
  accountInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  iconPillText: { fontSize: 13, fontWeight: '700' },
  expandShell: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  expandHeadPress: {
    alignSelf: 'stretch',
  },
  expandHeadInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  expandTitle: { fontSize: 17, fontWeight: '800' },
  chev: { fontSize: 14, fontWeight: '800' },
  expandBody: {
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  collapseUp: { alignSelf: 'flex-start', marginBottom: spacing.sm, paddingVertical: 4 },
  collapseUpText: { fontSize: 14, fontWeight: '800' },
  policyP: { fontSize: 14, lineHeight: 21 },
  tripInner: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  tripMeta: { fontSize: 11, fontWeight: '700', letterSpacing: 0.35, textTransform: 'uppercase' },
  tripTitle: { fontSize: 16, fontWeight: '800' },
  moreInner: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  moreLinkText: { fontSize: 15, fontWeight: '700' },
});
