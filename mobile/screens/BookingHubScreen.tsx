import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { PrimaryButton } from '../components/PrimaryButton';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingHub'>;

type BookRow = { id: string; label: string; meta: string; price: string; best?: boolean };

const FLIGHTS_OUTBOUND: BookRow[] = [
  { id: 'f1o', label: 'ANA 107 · SFO → NRT', meta: 'Outbound · economy · preferred', price: '$1,180', best: true },
  { id: 'f2o', label: 'UA 875 · SFO → NRT', meta: 'Outbound · economy · 1 stop', price: '$1,240' },
  { id: 'f3o', label: 'JL 002 · SFO → HND', meta: 'Outbound · economy · Haneda', price: '$1,205' },
];

const FLIGHTS_RETURN: BookRow[] = [
  { id: 'f1r', label: 'JL 058 · NRT → SFO', meta: 'Return · economy · same alliance', price: '$1,120', best: true },
  { id: 'f2r', label: 'UA 838 · NRT → SFO', meta: 'Return · economy · 1 stop', price: '$1,090' },
  { id: 'f3r', label: 'NH 008 · HND → SFO', meta: 'Return · economy · Haneda', price: '$1,175' },
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
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Pick outbound and return flights separately. AI pick ranks the best price that still satisfies policy.
      </Text>

      <Text style={[styles.section, { color: colors.textMuted }]}>Flights · outbound</Text>
      {FLIGHTS_OUTBOUND.map((r) => (
        <LiquidGlassPressable
          key={r.id}
          onPress={() =>
            navigation.navigate('PaymentApproval', {
              title: r.label,
              amountUsd: parseInt(r.price.replace(/[^0-9]/g, ''), 10) || 1180,
              policyState: 'within_policy',
            })
          }
          variant={r.best ? 'tileAccent' : 'tile'}
          minHeight={76}
          innerStyle={styles.rowInner}
        >
          <View style={{ flex: 1 }}>
            {r.best ? (
              <Text style={[styles.badge, { color: colors.accent }]}>AI pick</Text>
            ) : null}
            <Text style={[styles.rowTitle, { color: colors.text }]}>{r.label}</Text>
            <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{r.meta}</Text>
          </View>
          <Text style={[styles.price, { color: colors.text }]}>{r.price}</Text>
        </LiquidGlassPressable>
      ))}

      <Text style={[styles.section, { color: colors.textMuted }]}>Flights · return</Text>
      {FLIGHTS_RETURN.map((r) => (
        <LiquidGlassPressable
          key={r.id}
          onPress={() =>
            navigation.navigate('PaymentApproval', {
              title: r.label,
              amountUsd: parseInt(r.price.replace(/[^0-9]/g, ''), 10) || 1120,
              policyState: 'within_policy',
            })
          }
          variant={r.best ? 'tileAccent' : 'tile'}
          minHeight={76}
          innerStyle={styles.rowInner}
        >
          <View style={{ flex: 1 }}>
            {r.best ? <Text style={[styles.badge, { color: colors.accent }]}>AI pick</Text> : null}
            <Text style={[styles.rowTitle, { color: colors.text }]}>{r.label}</Text>
            <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{r.meta}</Text>
          </View>
          <Text style={[styles.price, { color: colors.text }]}>{r.price}</Text>
        </LiquidGlassPressable>
      ))}

      <Text style={[styles.section, { color: colors.textMuted }]}>Hotels</Text>
      {HOTELS.map((r) => (
        <LiquidGlassPressable
          key={r.id}
          onPress={() =>
            navigation.navigate('PaymentApproval', {
              title: r.label,
              amountUsd: parseInt(r.price.replace(/[^0-9]/g, ''), 10) || 220,
              policyState: r.id === 'h3' ? 'requires_approval' : 'within_policy',
            })
          }
          variant={r.best ? 'tileAccent' : 'tile'}
          minHeight={76}
          innerStyle={styles.rowInner}
        >
          <View style={{ flex: 1 }}>
            {r.best ? <Text style={[styles.badge, { color: colors.accent }]}>AI pick</Text> : null}
            <Text style={[styles.rowTitle, { color: colors.text }]}>{r.label}</Text>
            <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{r.meta}</Text>
          </View>
          <Text style={[styles.price, { color: colors.text }]}>{r.price}</Text>
        </LiquidGlassPressable>
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
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  badge: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowMeta: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '800' },
});
