import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { radii, spacing, useAppTheme } from '../utils/theme';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = MainTabScreenProps<'HomeTab'>;

export function HomeScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { trip, user, loading, notifications } = useAppState();
  const unread = notifications.filter((n) => !n.read).length;
  const companionUpdates = notifications.filter((n) => n.agent);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.kicker, { color: colors.textMuted }]}>Intelligent Travel Companion</Text>
            <Text style={[styles.greet, { color: colors.text }]}>
              {loading || !user ? 'Hello' : `Hi, ${user.displayName.split(' ')[0]}`}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.notifPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Updates"
          >
            <Text style={[styles.notifText, { color: colors.text }]}>Updates</Text>
            {unread > 0 ? (
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            ) : null}
          </Pressable>
        </View>

        {loading || !trip ? (
          <Text style={{ color: colors.textSecondary, marginTop: spacing.lg }}>Preparing your trip…</Text>
        ) : (
          <>
            <Card style={styles.heroCard}>
              <Text style={[styles.dest, { color: colors.textMuted }]}>Current trip</Text>
              <Text style={[styles.destTitle, { color: colors.text }]}>
                {trip.destination} · {trip.destinationCode}
              </Text>
              <View style={styles.heroRow}>
                <StatusBadge variant="trip" value={trip.health} />
                <Text style={[styles.approved, { color: colors.success }]}>Status: Approved</Text>
              </View>
              <Text style={[styles.calm, { color: colors.textSecondary }]}>{trip.healthMessage}</Text>
            </Card>

            <View style={styles.section}>
              <SectionHeader
                title="Companion updates"
                subtitle="Agent A (Scout): disruptions & risk. Agent B (Treasurer): FX & escrow."
              />
              <Card padded={false}>
                {companionUpdates.length === 0 ? (
                  <Text style={[styles.agentEmpty, { color: colors.textSecondary, padding: spacing.md }]}>
                    No agent updates yet.
                  </Text>
                ) : (
                  companionUpdates.slice(0, 5).map((n, idx) => (
                    <View
                      key={n.id}
                      style={[
                        styles.agentRow,
                        idx < Math.min(companionUpdates.length, 5) - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.agentPill, { backgroundColor: colors.accentMuted }]}>
                        <Text style={[styles.agentPillText, { color: colors.accent }]}>
                          {n.agent === 'scout' ? 'Scout' : 'Treasurer'}
                        </Text>
                      </View>
                      <View style={styles.agentBody}>
                        <Text style={[styles.agentTitle, { color: colors.text }]}>{n.title}</Text>
                        <Text style={[styles.agentBodyText, { color: colors.textSecondary }]}>{n.body}</Text>
                        <Text style={[styles.agentTime, { color: colors.textMuted }]}>{n.timeLabel}</Text>
                      </View>
                    </View>
                  ))
                )}
              </Card>
              <Pressable
                onPress={() => navigation.navigate('Notifications')}
                style={styles.seeAll}
                accessibilityRole="button"
              >
                <Text style={[styles.seeAllText, { color: colors.accent }]}>See all updates</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Next action" subtitle="One thing to focus on right now." />
              <Card>
                <Text style={[styles.nextTitle, { color: colors.text }]}>{trip.nextActionTitle}</Text>
                {trip.nextActionSubtitle ? (
                  <Text style={[styles.nextSub, { color: colors.textSecondary }]}>{trip.nextActionSubtitle}</Text>
                ) : null}
              </Card>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Today" subtitle="Timeline for the day." />
              <Card padded={false}>
                {trip.timelineToday.map((e, idx) => (
                  <View
                    key={e.id}
                    style={[
                      styles.timelineRow,
                      idx < trip.timelineToday.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.time, { color: colors.textMuted }]}>{e.timeLabel}</Text>
                    <View style={styles.timelineBody}>
                      <Text style={[styles.tTitle, { color: colors.text }]}>{e.title}</Text>
                      {e.subtitle ? (
                        <Text style={[styles.tSub, { color: colors.textSecondary }]}>{e.subtitle}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </Card>
            </View>

            <View style={styles.section}>
              <PrimaryButton title="Fix my situation" onPress={() => navigation.navigate('FixSituation')} />
            </View>

            <View style={styles.section}>
              <SectionHeader title="Quick actions" />
              <View style={styles.quickGrid}>
                <SecondaryButton title="View itinerary" onPress={() => navigation.navigate('Itinerary')} />
                <SecondaryButton title="Get help" onPress={() => navigation.navigate('HelpInsurance')} />
                <SecondaryButton title="View expenses" onPress={() => navigation.navigate('Expenses')} />
              </View>
            </View>

            <Text style={[styles.footerNote, { color: colors.textMuted }]}>
              $300/day budget · Tokyo · Mock data for prototype
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  greet: { fontSize: 26, fontWeight: '700', marginTop: 4, letterSpacing: -0.4 },
  notifPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  notifText: { fontSize: 14, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  heroCard: { gap: spacing.sm },
  dest: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  destTitle: { fontSize: 22, fontWeight: '700' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  approved: { fontSize: 13, fontWeight: '600' },
  calm: { fontSize: 15, lineHeight: 22 },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  nextTitle: { fontSize: 18, fontWeight: '700' },
  nextSub: { fontSize: 15, marginTop: 4 },
  timelineRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  time: { width: 52, fontSize: 14, fontWeight: '600', paddingTop: 2 },
  timelineBody: { flex: 1, gap: 2 },
  tTitle: { fontSize: 16, fontWeight: '600' },
  tSub: { fontSize: 14, lineHeight: 20 },
  quickGrid: { gap: spacing.sm },
  footerNote: { marginTop: spacing.xl, fontSize: 12, textAlign: 'center' },
  agentRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  agentPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  agentPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  agentBody: { flex: 1, gap: 4 },
  agentTitle: { fontSize: 16, fontWeight: '700' },
  agentBodyText: { fontSize: 14, lineHeight: 20 },
  agentTime: { fontSize: 12, fontWeight: '600' },
  agentEmpty: { fontSize: 15, lineHeight: 22 },
  seeAll: { alignSelf: 'center', marginTop: spacing.xs, paddingVertical: spacing.sm },
  seeAllText: { fontSize: 15, fontWeight: '600' },
});
