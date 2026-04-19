import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import { companionLaneLabel } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = MainTabScreenProps<'HomeTab'>;

export function HomeScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { trip, user, loading, notifications } = useAppState();
  const unread = notifications.filter((n) => !n.read).length;
  const insightUpdates = notifications.filter((n) => n.lane);
  const [dayExpanded, setDayExpanded] = useState(false);

  const toggleDay = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDayExpanded((v) => !v);
  };

  const visibleTimeline = dayExpanded ? trip?.timelineToday ?? [] : trip?.timelineToday.slice(0, 2) ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
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
                title="Trip insights"
                subtitle="Swipe for Safety and Spend highlights — full grid lives in Updates."
              />
              {insightUpdates.length === 0 ? (
                <Card>
                  <Text style={[styles.insightEmpty, { color: colors.textSecondary }]}>No insights yet.</Text>
                </Card>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.insightCarousel}
                  decelerationRate="fast"
                >
                  {insightUpdates.slice(0, 8).map((n) => (
                    <Pressable
                      key={n.id}
                      onPress={() => navigation.navigate('Notifications')}
                      style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      accessibilityRole="button"
                    >
                      <View style={[styles.insightPill, { backgroundColor: colors.accentMuted }]}>
                        <Text style={[styles.insightPillText, { color: colors.accent }]}>
                          {n.lane ? companionLaneLabel(n.lane) : ''}
                        </Text>
                      </View>
                      <Text style={[styles.insightCardTitle, { color: colors.text }]} numberOfLines={2}>
                        {n.title}
                      </Text>
                      <Text style={[styles.insightCardBody, { color: colors.textSecondary }]} numberOfLines={3}>
                        {n.body}
                      </Text>
                      <Text style={[styles.insightTime, { color: colors.textMuted }]}>{n.timeLabel}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
              <Pressable
                onPress={() => navigation.navigate('Notifications')}
                style={styles.seeAll}
                accessibilityRole="button"
              >
                <Text style={[styles.seeAllText, { color: colors.accent }]}>Open updates mosaic</Text>
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
              <SectionHeader title="Today" subtitle="Peek at the next steps — expand for the full run of day." />
              <Card padded={false}>
                {visibleTimeline.map((e, idx) => (
                  <View
                    key={e.id}
                    style={[
                      styles.timelineRow,
                      idx < visibleTimeline.length - 1 && {
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
              {(trip.timelineToday.length ?? 0) > 2 ? (
                <Pressable onPress={toggleDay} style={styles.expandDay} accessibilityRole="button">
                  <Text style={[styles.expandDayText, { color: colors.accent }]}>
                    {dayExpanded ? 'Show less' : `Show full day (${trip.timelineToday.length} stops)`}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.section}>
              <SectionHeader
                title="Travel help"
                subtitle="Everyday fixes and a path if you’re stranded."
              />
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
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
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
  insightCarousel: { gap: spacing.sm, paddingVertical: 4 },
  insightCard: {
    width: 260,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  insightCardTitle: { fontSize: 16, fontWeight: '700' },
  insightCardBody: { fontSize: 14, lineHeight: 20 },
  insightPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  insightPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  insightTime: { fontSize: 12, fontWeight: '600' },
  insightEmpty: { fontSize: 15, lineHeight: 22 },
  emergencyCard: { gap: spacing.sm },
  emergencyKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  emergencyTitle: { fontSize: 17, fontWeight: '700' },
  emergencyBody: { fontSize: 14, lineHeight: 22 },
  seeAll: { alignSelf: 'center', marginTop: spacing.xs, paddingVertical: spacing.sm },
  seeAllText: { fontSize: 15, fontWeight: '600' },
  expandDay: { alignSelf: 'center', marginTop: spacing.sm, paddingVertical: spacing.sm },
  expandDayText: { fontSize: 15, fontWeight: '600' },
});
