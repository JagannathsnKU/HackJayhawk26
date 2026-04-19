import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FoodDiscover'>;

type Diet = 'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'halal';

const RESTAURANTS: {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price: string;
  diets: Diet[];
  blurb: string;
}[] = [
  {
    id: 'r1',
    name: 'Tsukiji Outer Counter',
    cuisine: 'Seafood · omakase',
    rating: 4.8,
    price: '$$$',
    diets: ['gluten_free'],
    blurb: 'Walkable from Ginza meetings · reservations open 7 days.',
  },
  {
    id: 'r2',
    name: 'Shinjuku Plant Kitchen',
    cuisine: 'Plant-forward',
    rating: 4.6,
    price: '$$',
    diets: ['vegetarian', 'vegan', 'gluten_free', 'halal'],
    blurb: 'Corporate-friendly receipt formatting · quiet booths.',
  },
  {
    id: 'r3',
    name: 'Ichiran Late Night',
    cuisine: 'Ramen',
    rating: 4.5,
    price: '$',
    diets: ['none'],
    blurb: 'Fast solo seating · good after long client dinners.',
  },
];

const DIET_FILTERS: { id: Diet; label: string }[] = [
  { id: 'none', label: 'Any' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten_free', label: 'Gluten-free' },
  { id: 'halal', label: 'Halal-friendly' },
];

export function FoodDiscoverScreen({}: Props) {
  const colors = useAppTheme();
  const [diet, setDiet] = useState<Diet>('none');

  const list = useMemo(() => {
    if (diet === 'none') return RESTAURANTS;
    return RESTAURANTS.filter((r) => r.diets.includes(diet) || r.diets.includes('none'));
  }, [diet]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.pageTitle, { color: colors.text }]}>Food</Text>

      <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Dietary filters</Text>
      <View style={styles.chips}>
        {DIET_FILTERS.map((f) => {
          const on = diet === f.id;
          return (
            <LiquidGlassPressable
              key={f.id}
              onPress={() => setDiet(f.id)}
              variant={on ? 'chipActive' : 'chip'}
              minHeight={40}
              pressableStyle={styles.chipWrap}
              innerStyle={styles.chipInner}
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.chipText, { color: on ? colors.text : colors.textMuted }]}>{f.label}</Text>
            </LiquidGlassPressable>
          );
        })}
      </View>

      {list.map((r) => (
        <Card key={r.id} style={{ gap: spacing.sm }}>
          <View style={styles.row}>
            <Text style={[styles.name, { color: colors.text }]}>{r.name}</Text>
            <Text style={[styles.stars, { color: colors.accent }]}>★ {r.rating.toFixed(1)}</Text>
          </View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {r.cuisine} · {r.price}
          </Text>
          <Text style={[styles.blurb, { color: colors.textSecondary }]}>{r.blurb}</Text>
          <LiquidGlassPressable
            onPress={() => {}}
            variant="secondary"
            minHeight={44}
            pressableStyle={{ alignSelf: 'flex-start' }}
            innerStyle={styles.ctaInner}
          >
            <Text style={[styles.ctaText, { color: colors.text }]}>Hold table (demo)</Text>
          </LiquidGlassPressable>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  filterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipWrap: { alignSelf: 'flex-start' },
  chipInner: { paddingVertical: 8, paddingHorizontal: spacing.md },
  chipText: { fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', flex: 1 },
  stars: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 14, fontWeight: '600' },
  blurb: { fontSize: 14, lineHeight: 20 },
  ctaInner: {
    marginTop: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  ctaText: { fontSize: 14, fontWeight: '700' },
});
