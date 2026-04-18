import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import type { ItineraryItem } from '../models/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Itinerary'>;

export function ItineraryScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { itinerary, loading } = useAppState();

  const renderItem = ({ item }: { item: ItineraryItem }) => (
    <Card onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })} style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={[styles.kind, { color: colors.textMuted }]}>{kindLabel(item.kind)}</Text>
        <StatusBadge variant="item" value={item.statusBadge} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {item.startTime}
          {item.endTime ? ` – ${item.endTime}` : ''}
        </Text>
      </View>
      <Text style={[styles.loc, { color: colors.textMuted }]}>{item.location}</Text>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading itinerary…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={itinerary}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListHeaderComponent={
        <Text style={[styles.header, { color: colors.textSecondary }]}>
          Tap a card for policy, budget, and actions.
        </Text>
      }
    />
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
  list: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  header: { marginBottom: spacing.md, fontSize: 14, lineHeight: 20 },
  card: { gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kind: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '700' },
  sub: { fontSize: 15, lineHeight: 21 },
  metaRow: { marginTop: 4 },
  meta: { fontSize: 14, fontWeight: '500' },
  loc: { fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
