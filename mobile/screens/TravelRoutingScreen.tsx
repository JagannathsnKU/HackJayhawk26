import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { TravelRoutingTokyoMap } from '../components/TravelRoutingTokyoMap';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelRouting'>;

type Phase = 'before' | 'during' | 'return';

const ROUTES: Record<
  Phase,
  { title: string; steps: { t: string; s: string }[] }
> = {
  before: {
    title: 'Before departure · Tokyo',
    steps: [
      { t: 'Narita · JL check-in', s: 'Terminal 2 · counters open · two bags tagged · car to city on file' },
      { t: 'Narita Express · NEX', s: 'Reserved seat to Tokyo Station · about 55 minutes · Suica also valid on non-reserved' },
      { t: 'Tokyo Station · Marunouchi', s: 'North gate coffee · pocket Wi‑Fi pickup at JR East Travel Service counter' },
    ],
  },
  during: {
    title: 'During stay · central Tokyo',
    steps: [
      { t: 'Ōtemachi Financial City', s: 'Tower B · compliance workshop 09:30 · visitor badge at Lobby 1' },
      { t: 'Ginza · Corridor', s: 'Client lunch · kaiseki · allow 15 minutes from Ōtemachi (Mita line)' },
      { t: 'Shinjuku · hotel', s: 'Key refreshed · laundry express · evening session in Roppongi' },
    ],
  },
  return: {
    title: 'Return travel',
    steps: [
      { t: 'Roppongi Hills', s: 'Partner wrap · receipts at 52F reception · taxi stand B after 22:00' },
      { t: 'Shinjuku → Narita', s: 'NEX reserved · allow 90 minutes before long-haul check-in' },
      { t: 'Narita · departure', s: 'International counters close T-60 · south-wing lounge if eligible' },
    ],
  },
};

export function TravelRoutingScreen({}: Props) {
  const colors = useAppTheme();
  const [phase, setPhase] = useState<Phase>('before');
  const bundle = ROUTES[phase];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.pageTitle, { color: colors.text }]}>Routes</Text>
      <Text style={[styles.mapCaption, { color: colors.textSecondary }]}>
        Tokyo · zoomed map with pinned stations, hotels, and meeting points
      </Text>
      <TravelRoutingTokyoMap />

      <View style={styles.tabs}>
        {(
          [
            { id: 'before' as const, label: 'Pre-departure' },
            { id: 'during' as const, label: 'During' },
            { id: 'return' as const, label: 'Return' },
          ] as const
        ).map((tab) => {
          const on = phase === tab.id;
          return (
            <LiquidGlassPressable
              key={tab.id}
              onPress={() => setPhase(tab.id)}
              variant={on ? 'chipActive' : 'chip'}
              minHeight={42}
              pressableStyle={styles.tabWrap}
              innerStyle={styles.tabInner}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.tabText, { color: on ? colors.text : colors.textMuted }]}>{tab.label}</Text>
            </LiquidGlassPressable>
          );
        })}
      </View>

      <Text style={[styles.phaseTitle, { color: colors.text }]}>{bundle.title}</Text>
      {bundle.steps.map((step, i) => (
        <Card key={i} style={{ gap: 6 }}>
          <Text style={[styles.stepT, { color: colors.text }]}>{step.t}</Text>
          <Text style={[styles.stepS, { color: colors.textSecondary }]}>{step.s}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  mapCaption: { fontSize: 13, lineHeight: 18, marginTop: -4 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tabWrap: { flex: 1, minWidth: 100 },
  tabInner: { paddingVertical: 10, paddingHorizontal: spacing.sm },
  tabText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  phaseTitle: { fontSize: 17, fontWeight: '800', marginTop: spacing.sm },
  stepT: { fontSize: 16, fontWeight: '700' },
  stepS: { fontSize: 14, lineHeight: 20 },
});
