import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import type { ItineraryItem } from '../models/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Itinerary'>;

const CARD_GAP = spacing.sm;

export function ItineraryScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { itinerary, loading } = useAppState();
  const [index, setIndex] = useState(0);
  const width = Dimensions.get('window').width;
  const cardW = width - screenPaddingX * 2 - 24;
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / (cardW + CARD_GAP));
    if (i !== index && i >= 0 && i < itinerary.length) setIndex(i);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: 'transparent' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading itinerary…</Text>
      </View>
    );
  }

  const current = itinerary[index];

  return (
    <View style={[styles.root, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.intro, { color: colors.textSecondary, paddingHorizontal: screenPaddingX }]}>
        Swipe the deck — tap a card for policy, budget, and actions.
      </Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={cardW + CARD_GAP}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.hScroll, { paddingHorizontal: screenPaddingX, gap: CARD_GAP }]}
        onMomentumScrollEnd={onScroll}
      >
        {itinerary.map((item) => (
          <LiquidGlassPressable
            key={item.id}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            variant="tile"
            minHeight={220}
            pressableStyle={{ width: cardW }}
            innerStyle={styles.carouselInner}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.kind, { color: colors.textMuted }]}>{kindLabel(item.kind)}</Text>
              <StatusBadge variant="item" value={item.statusBadge} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {item.startTime}
              {item.endTime ? ` – ${item.endTime}` : ''}
            </Text>
            <Text style={[styles.loc, { color: colors.textMuted }]} numberOfLines={2}>
              {item.location}
            </Text>
            <Text style={[styles.tapHint, { color: colors.accent }]}>Open details →</Text>
          </LiquidGlassPressable>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {itinerary.map((seg, i) => (
          <View
            key={seg.id}
            style={[
              styles.dot,
              { backgroundColor: i === index ? colors.accent : colors.border },
            ]}
          />
        ))}
      </View>

      {current ? (
        <View style={[styles.focusStrip, { paddingHorizontal: screenPaddingX }]}>
          <Text style={[styles.focusKicker, { color: colors.textMuted }]}>Focused segment</Text>
          <Text style={[styles.focusTitle, { color: colors.text }]} numberOfLines={1}>
            {current.title}
          </Text>
          <View style={styles.quickRow}>
            <LiquidGlassPressable
              onPress={() => navigation.navigate('ItemDetail', { itemId: current.id })}
              variant="secondary"
              minHeight={42}
              pressableStyle={{ alignSelf: 'flex-start' }}
              innerStyle={styles.miniBtnInner}
            >
              <Text style={[styles.miniBtnText, { color: colors.text }]}>Full detail</Text>
            </LiquidGlassPressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function kindLabel(k: ItineraryItem['kind']) {
  switch (k) {
    case 'flight':
      return 'Flight';
    case 'hotel':
      return 'Hotel';
    case 'meeting':
      return 'Meeting';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  hScroll: { paddingBottom: spacing.md },
  carouselInner: {
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kind: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  sub: { fontSize: 15, lineHeight: 21 },
  meta: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  loc: { fontSize: 14, marginTop: 4 },
  tapHint: { fontSize: 13, fontWeight: '700', marginTop: 'auto', paddingTop: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4 },
  focusStrip: { gap: 6, paddingBottom: spacing.xl },
  focusKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  focusTitle: { fontSize: 17, fontWeight: '700' },
  quickRow: { flexDirection: 'row', marginTop: spacing.xs },
  miniBtnInner: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  miniBtnText: { fontSize: 14, fontWeight: '600' },
});
