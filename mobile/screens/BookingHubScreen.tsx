import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { PrimaryButton } from '../components/PrimaryButton';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingHub'>;

type BookRow = { id: string; label: string; meta: string; price: string; best?: boolean };

const FLIGHTS: BookRow[] = [
  { id: 'f1', label: 'ANA 107 · SFO–NRT', meta: 'Economy · preferred · arrives 14:20', price: '$1,180', best: true },
  { id: 'f2', label: 'UA 875 · SFO–NRT', meta: 'Economy · 1 stop', price: '$1,240' },
  { id: 'f3', label: 'JL 002 · SFO–HND', meta: 'Economy · Haneda', price: '$1,205' },
];

const HOTELS: BookRow[] = [
  { id: 'h1', label: 'Hotel New Otani', meta: 'Corp rate · breakfast', price: '$220/night', best: true },
  { id: 'h2', label: 'Hyatt Regency Tokyo', meta: 'Within cap', price: '$265/night' },
  { id: 'h3', label: 'Park Hyatt Tokyo', meta: 'Needs approval', price: '$410/night' },
];

export function BookingHubScreen({ navigation }: Props) {
  const colors = useAppTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.title, { color: colors.text }]}>Booking</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>AI pick = best price inside policy (demo).</Text>

      <Text style={[styles.section, { color: colors.textMuted }]}>Flights</Text>
      {FLIGHTS.map((r) => (
        <Pressable
          key={r.id}
          onPress={() =>
            navigation.navigate('PaymentApproval', {
              title: r.label,
              amountUsd: parseInt(r.price.replace(/[^0-9]/g, ''), 10) || 1180,
              policyState: 'within_policy',
            })
          }
          style={[
            styles.row,
            {
              borderColor: r.best ? colors.accent : colors.border,
              backgroundColor: r.best ? colors.accentMuted : colors.surface,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            {r.best ? (
              <Text style={[styles.badge, { color: colors.accent }]}>AI pick</Text>
            ) : null}
            <Text style={[styles.rowTitle, { color: colors.text }]}>{r.label}</Text>
            <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{r.meta}</Text>
          </View>
          <Text style={[styles.price, { color: colors.text }]}>{r.price}</Text>
        </Pressable>
      ))}

      <Text style={[styles.section, { color: colors.textMuted }]}>Hotels</Text>
      {HOTELS.map((r) => (
        <Pressable
          key={r.id}
          onPress={() =>
            navigation.navigate('PaymentApproval', {
              title: r.label,
              amountUsd: parseInt(r.price.replace(/[^0-9]/g, ''), 10) || 220,
              policyState: r.id === 'h3' ? 'requires_approval' : 'within_policy',
            })
          }
          style={[
            styles.row,
            {
              borderColor: r.best ? colors.accent : colors.border,
              backgroundColor: r.best ? colors.accentMuted : colors.surface,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            {r.best ? <Text style={[styles.badge, { color: colors.accent }]}>AI pick</Text> : null}
            <Text style={[styles.rowTitle, { color: colors.text }]}>{r.label}</Text>
            <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{r.meta}</Text>
          </View>
          <Text style={[styles.price, { color: colors.text }]}>{r.price}</Text>
        </Pressable>
      ))}

      <PrimaryButton
        title="Cars · reserve"
        onPress={() =>
          navigation.navigate('PaymentApproval', {
            title: 'Rental car · approved vendor',
            amountUsd: 189,
            policyState: 'within_policy',
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  hint: { fontSize: 12, lineHeight: 16 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowMeta: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '800' },
});
