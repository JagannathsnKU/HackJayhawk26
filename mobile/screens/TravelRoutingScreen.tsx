import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelRouting'>;

type Phase = 'before' | 'during' | 'return';

const ROUTES: Record<
  Phase,
  { title: string; steps: { t: string; s: string }[] }
> = {
  before: {
    title: 'Before departure',
    steps: [
      { t: 'Home → SFO', s: 'Leave 2h 10m before international · light traffic now' },
      { t: 'SFO security', s: 'Terminal 2 · CLEAR + PreCheck lanes historically faster' },
      { t: 'Gate B12', s: 'ANA 107 · boarding starts T-40' },
    ],
  },
  during: {
    title: 'During trip',
    steps: [
      { t: 'NRT arrival', s: 'Immigration average 25m · baggage carousel 2' },
      { t: 'Narita Express', s: 'Shinjuku direct · Suica accepted' },
      { t: 'Hotel New Otani', s: 'Check-in after 15:00 · corporate code on file' },
    ],
  },
  return: {
    title: 'Return travel',
    steps: [
      { t: 'Hotel → NRT', s: 'Allow 90m from Shinjuku at peak' },
      { t: 'JL 058 check-in', s: 'Business upgrade pending policy approval' },
      { t: 'SFO customs', s: 'Global Entry recommended · onward car booked' },
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
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tabWrap: { flex: 1, minWidth: 100 },
  tabInner: { paddingVertical: 10, paddingHorizontal: spacing.sm },
  tabText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  phaseTitle: { fontSize: 17, fontWeight: '800', marginTop: spacing.sm },
  stepT: { fontSize: 16, fontWeight: '700' },
  stepS: { fontSize: 14, lineHeight: 20 },
});
