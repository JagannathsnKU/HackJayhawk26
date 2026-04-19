import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';

type Props = NativeStackScreenProps<RootStackParamList, 'CurrentMeetings'>;

export function CurrentMeetingsScreen({}: Props) {
  const colors = useAppTheme();
  const { itinerary, trip, loading } = useAppState();
  const meetings = itinerary.filter((i) => i.kind === 'meeting');

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.pageTitle, { color: colors.text }]}>Meetings</Text>

      {loading || !trip ? (
        <Text style={{ color: colors.textSecondary }}>Loading…</Text>
      ) : meetings.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSecondary }}>No meetings scheduled for this trip yet.</Text>
        </Card>
      ) : (
        meetings.map((m) => (
          <Card key={m.id} style={{ gap: spacing.sm }}>
            <Text style={[styles.title, { color: colors.text }]}>{m.title}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{m.subtitle}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>
              {m.startTime}
              {m.endTime ? ` – ${m.endTime}` : ''}
            </Text>
            <Text style={[styles.loc, { color: colors.text }]}>{m.location}</Text>
            {m.detailBullets.map((b) => (
              <Text key={b} style={[styles.bullet, { color: colors.textSecondary }]}>
                · {b}
              </Text>
            ))}
            <LiquidGlassPressable
              onPress={() => void Linking.openURL('https://calendar.google.com')}
              variant="secondary"
              minHeight={44}
              pressableStyle={{ alignSelf: 'flex-start' }}
              innerStyle={styles.linkInner}
            >
              <Text style={{ color: colors.text, fontWeight: '700' }}>Open calendar (external)</Text>
            </LiquidGlassPressable>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 15, lineHeight: 22 },
  time: { fontSize: 14, fontWeight: '700' },
  loc: { fontSize: 15, fontWeight: '600' },
  bullet: { fontSize: 14, lineHeight: 20 },
  linkInner: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
});
