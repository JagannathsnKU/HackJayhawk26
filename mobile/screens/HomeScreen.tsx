import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { HubTile } from '../components/HubTile';
import { Card } from '../components/Card';
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.textMuted }]}>Nexus</Text>
            <Text style={[styles.greet, { color: colors.text }]}>
              {loading || !user ? 'Hello' : `Hi, ${user.displayName.split(' ')[0]}`}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={[styles.iconPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Text style={[styles.iconPillText, { color: colors.text }]}>Account</Text>
          </Pressable>
        </View>

        <View style={styles.row2}>
          <View style={styles.half}>
            <HubTile title="Plan new trip" icon="＋" variant="accent" compact onPress={() => navigation.navigate('PlanNewTrip')} />
          </View>
          <View style={styles.half}>
            <HubTile title="Current trip" icon="→" compact onPress={() => navigation.navigate('CurrentTrip')} />
          </View>
        </View>

        <View style={[styles.expandShell, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setPolicyOpen((o) => !o)}
            style={styles.expandHead}
            accessibilityRole="button"
            accessibilityState={{ expanded: policyOpen }}
          >
            <Text style={[styles.expandTitle, { color: colors.text }]}>Travel policy</Text>
            <Text style={[styles.chev, { color: colors.accent }]}>{policyOpen ? '▲' : '▼'}</Text>
          </Pressable>
          {policyOpen ? (
            <View style={[styles.expandBody, { borderTopColor: colors.border }]}>
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

        <View style={[styles.expandShell, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setHistoryOpen((o) => !o)}
            style={styles.expandHead}
            accessibilityRole="button"
            accessibilityState={{ expanded: historyOpen }}
          >
            <Text style={[styles.expandTitle, { color: colors.text }]}>Previous trips</Text>
            <Text style={[styles.chev, { color: colors.accent }]}>{historyOpen ? '▲' : '▼'}</Text>
          </Pressable>
          {historyOpen ? (
            <View style={[styles.expandBody, { borderTopColor: colors.border, gap: spacing.sm }]}>
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
                <Pressable
                  onPress={() => navigation.navigate('CurrentTrip')}
                  style={[styles.tripRow, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                >
                  <Text style={[styles.tripMeta, { color: colors.textMuted }]}>Active</Text>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>
                    {trip.destination} · {trip.destinationCode}
                  </Text>
                </Pressable>
              ) : null}
              {PAST_TRIP_LIST.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => navigation.navigate('PastTripSummary', { pastTripId: p.id })}
                  style={[styles.tripRow, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                >
                  <Text style={[styles.tripMeta, { color: colors.textMuted }]}>{p.dateLabel}</Text>
                  <Text style={[styles.tripTitle, { color: colors.text }]}>{p.title}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => navigation.navigate('Badges')} style={styles.moreLink}>
                <Text style={[styles.moreLinkText, { color: colors.accent }]}>Badges</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.full}>
          <HubTile title="Badges" icon="★" compact onPress={() => navigation.navigate('Badges')} />
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
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  greet: { fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.4 },
  row2: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1, minWidth: 0 },
  full: { width: '100%' },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconPillText: { fontSize: 13, fontWeight: '700' },
  expandShell: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  expandHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  expandTitle: { fontSize: 17, fontWeight: '800' },
  chev: { fontSize: 14, fontWeight: '800' },
  expandBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  collapseUp: { alignSelf: 'flex-start', marginBottom: spacing.sm, paddingVertical: 4 },
  collapseUpText: { fontSize: 14, fontWeight: '800' },
  policyP: { fontSize: 14, lineHeight: 21 },
  tripRow: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: 4,
  },
  tripMeta: { fontSize: 11, fontWeight: '700', letterSpacing: 0.35, textTransform: 'uppercase' },
  tripTitle: { fontSize: 16, fontWeight: '800' },
  moreLink: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  moreLinkText: { fontSize: 15, fontWeight: '700' },
});
