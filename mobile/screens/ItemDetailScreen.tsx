import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { findItineraryItem } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
import { DetailView } from '../components/DetailView';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetail'>;

export function ItemDetailScreen({ navigation, route }: Props) {
  const colors = useAppTheme();
  const { itinerary } = useAppState();
  const item = useMemo(
    () => findItineraryItem(itinerary, route.params.itemId),
    [itinerary, route.params.itemId],
  );

  if (!item) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: spacing.md }}>This item is no longer available.</Text>
      </View>
    );
  }

  const openPayment = (title: string, amountUsd: number) => {
    navigation.navigate('PaymentApproval', {
      title,
      amountUsd,
      policyState: item.policyState,
      itineraryItemId: item.id,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <DetailView
        item={item}
        onModify={() => openPayment('Modify booking', Math.max(item.spendAmount, 120))}
        onReplace={() => openPayment('Replace option', item.spendAmount + 45)}
        onAlternatives={() => openPayment('Alternative options', item.spendAmount - 30)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  fallback: { flex: 1 },
});
