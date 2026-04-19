import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatusBadge } from '../components/StatusBadge';
import { useFormatters } from '../hooks/useFormatters';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentApproval'>;

export function PaymentApprovalScreen({ navigation, route }: Props) {
  const colors = useAppTheme();
  const { policyLabel } = useFormatters();
  const { services } = useAppState();
  const { title, amountUsd, policyState, itineraryItemId } = route.params;
  const [busy, setBusy] = useState(false);

  const policyHeadline =
    policyState === 'within_policy'
      ? 'Approved automatically'
      : policyState === 'requires_approval'
        ? 'Requires approval'
        : 'Not allowed';

  const onConfirm = async () => {
    setBusy(true);
    try {
      const result = await services.payment.authorizePayment({
        amountUsd,
        description: title,
        vendorName: title,
        itineraryItemId,
      });
      if (result.status === 'approved_auto') {
        Alert.alert(
          'Booking confirmed',
          `Payment processed on XRPL.\nRef: ${result.reference}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else if (result.status === 'requires_approval') {
        Alert.alert('Approval required', 'Request queued for your manager.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Not allowed', `Blocked: ${result.reference}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Error', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: 'transparent' }]}>
      <Card>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.cost, { color: colors.text }]}>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountUsd)}
        </Text>
        <Text style={[styles.policyCopy, { color: colors.textSecondary }]}>
          {policyLabel(policyState)} · {policyHeadline}
        </Text>
        <View style={styles.badgeRow}>
          <StatusBadge variant="policy" value={policyState} />
        </View>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {policyState === 'within_policy'
            ? 'This confirmation is within typical policy for your traveler profile.'
            : 'Use alternatives or request approval — charges are not submitted until treasury confirms.'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <PrimaryButton title="Confirm" onPress={() => void onConfirm()} loading={busy} />
        <SecondaryButton
          title="Request approval"
          onPress={() =>
            Alert.alert('Request sent', 'Your manager will be notified in the approvals channel.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ])
          }
          disabled={policyState === 'within_policy'}
        />
        <SecondaryButton
          title="View alternatives"
          onPress={() => navigation.navigate('FixSituation')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  title: { fontSize: 20, fontWeight: '700' },
  cost: { fontSize: 28, fontWeight: '700', marginTop: spacing.sm },
  policyCopy: { fontSize: 15, lineHeight: 22, marginTop: spacing.md },
  badgeRow: { marginTop: spacing.md },
  hint: { fontSize: 13, lineHeight: 18, marginTop: spacing.sm },
  actions: { gap: spacing.sm },
});
