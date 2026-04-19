import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getPastTripDetail } from '../utils/pastTrips';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PastTripSummary'>;

export function PastTripSummaryScreen({ route }: Props) {
  const colors = useAppTheme();
  const detail = getPastTripDetail(route.params.pastTripId);

  if (!detail) {
    return (
      <View style={[styles.center, { backgroundColor: 'transparent' }]}>
        <Text style={{ color: colors.textSecondary }}>Trip not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.date, { color: colors.textMuted }]}>{detail.dateLabel}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{detail.title}</Text>
      <Card style={{ gap: spacing.sm }}>
        {detail.bullets.map((line) => (
          <Text key={line} style={[styles.line, { color: colors.textSecondary }]}>
            · {line}
          </Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800' },
  line: { fontSize: 15, lineHeight: 22 },
});
