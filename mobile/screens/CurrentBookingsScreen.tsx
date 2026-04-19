import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { PrimaryButton } from '../components/PrimaryButton';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { SampleItineraryChecklist } from '../components/SampleItineraryChecklist';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { sampleItineraryFromTrip } from '../utils/sampleItineraries';

type Props = NativeStackScreenProps<RootStackParamList, 'CurrentBookings'>;

export function CurrentBookingsScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { itinerary, trip, loading } = useAppState();
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setConfirmed((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.pageTitle, { color: colors.text }]}>Bookings</Text>

      <PrimaryButton title="New booking" onPress={() => navigation.navigate('BookingHub')} />

      {loading ? (
        <Text style={{ color: colors.textSecondary }}>Loading…</Text>
      ) : (
        <>
          <Text style={[styles.sub, { color: colors.textMuted }]}>Confirmed</Text>
          {itinerary.map((item) => {
            const ok = Boolean(confirmed[item.id]);
            return (
              <LiquidGlassPressable
                key={item.id}
                onPress={() => toggle(item.id)}
                variant={ok ? 'tileAccent' : 'tile'}
                minHeight={72}
                innerStyle={styles.rowInner}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ok }}
              >
                <View
                  style={[
                    styles.box,
                    { borderColor: colors.accent, backgroundColor: ok ? colors.accent : 'transparent' },
                  ]}
                >
                  {ok ? <Text style={styles.check}>✓</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                </View>
                <LiquidGlassPressable
                  onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                  variant="secondary"
                  minHeight={40}
                  pressableStyle={styles.detailPress}
                  innerStyle={styles.detailInner}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>Details</Text>
                </LiquidGlassPressable>
              </LiquidGlassPressable>
            );
          })}

          {trip ? (
            <>
              <Text style={[styles.sub, { color: colors.textMuted }]}>Itinerary</Text>
              <SampleItineraryChecklist itinerary={sampleItineraryFromTrip(trip)} mode="checklist" />
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#000', fontWeight: '900', fontSize: 14 },
  title: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 13, marginTop: 2 },
  detailPress: { flexShrink: 0 },
  detailInner: { paddingVertical: 8, paddingHorizontal: spacing.sm },
});
