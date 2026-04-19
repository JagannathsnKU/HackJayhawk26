import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { DrillDownModal } from '../components/DrillDownModal';
import { SectionHeader } from '../components/SectionHeader';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpInsurance'>;

const TOPICS = [
  { id: 'med', label: 'Medical', description: 'Injury, illness, or clinic referral', icon: '◆' },
  { id: 'disrupt', label: 'Disruption', description: 'Delays, cancellations, missed connections', icon: '◇' },
  { id: 'emergency', label: 'Emergency', description: 'Urgent safety or security situations', icon: '◎' },
] as const;

export function HelpInsuranceScreen({}: Props) {
  const colors = useAppTheme();
  const [topicId, setTopicId] = useState<string | null>(null);
  const selected = TOPICS.find((t) => t.id === topicId);

  return (
    <View style={[styles.root, { backgroundColor: 'transparent' }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SectionHeader title="You’re covered" subtitle="Lockton travel protection — pick a lane." />

        <Card>
          <Text style={[styles.covered, { color: colors.success }]}>You are covered</Text>
          <Text style={[styles.coveredBody, { color: colors.textSecondary }]}>
            Emergency medical, trip disruption, and security assistance — production links to your policy PDF.
          </Text>
        </Card>

        <Text style={[styles.laneTitle, { color: colors.textMuted }]}>What do you need?</Text>
        <View style={styles.laneGrid}>
          {TOPICS.map((t) => (
            <LiquidGlassPressable
              key={t.id}
              onPress={() => setTopicId(t.id)}
              variant={topicId === t.id ? 'tileAccent' : 'tile'}
              minHeight={112}
              pressableStyle={styles.lanePress}
              innerStyle={styles.laneInner}
              accessibilityState={{ selected: topicId === t.id }}
            >
              <Text style={[styles.laneIcon, { color: colors.accent }]}>{t.icon}</Text>
              <Text style={[styles.laneLabel, { color: colors.text }]}>{t.label}</Text>
              <Text style={[styles.lanePeek, { color: colors.textMuted }]} numberOfLines={2}>
                {t.description}
              </Text>
            </LiquidGlassPressable>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Tap a lane above — guidance opens in a focused panel.
        </Text>
      </ScrollView>

      <DrillDownModal
        visible={selected != null}
        onClose={() => setTopicId(null)}
        title={selected?.label ?? ''}
        subtitle="Suggested path"
      >
        <Text style={[styles.modalLead, { color: colors.textSecondary }]}>{selected?.description}</Text>
        <Text style={[styles.modalActions, { color: colors.text }]}>Suggested actions</Text>
        <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
          • Call the 24/7 travel line{'\n'}• Message your trip owner at Lockton{'\n'}• Save receipts for any
          out-of-pocket costs
        </Text>
      </DrillDownModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: spacing.md },
  body: {
    paddingHorizontal: screenPaddingX,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  covered: { fontSize: 16, fontWeight: '700' },
  coveredBody: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  laneTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  laneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  lanePress: {
    width: '31%',
    flexGrow: 1,
    minWidth: 100,
  },
  laneInner: {
    alignItems: 'flex-start',
    padding: spacing.sm,
    gap: 6,
  },
  laneIcon: { fontSize: 20, fontWeight: '600' },
  laneLabel: { fontSize: 15, fontWeight: '700' },
  lanePeek: { fontSize: 12, lineHeight: 16 },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm },
  modalLead: { fontSize: 16, lineHeight: 24, marginBottom: spacing.md },
  modalActions: { fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  modalBody: { fontSize: 15, lineHeight: 24 },
});
