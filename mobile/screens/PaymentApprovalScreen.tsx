import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
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
        amountUsd: amountUsd ?? 0,
        description: title,
        itineraryItemId,
      });
      const msg =
        result.status === 'approved_auto'
          ? 'Recorded (stub). In production, confirmation ties to your TMC / card auth.'
          : result.status === 'requires_approval'
            ? 'Approval request queued (stub).'
            : 'Blocked (stub).';
      Alert.alert('Review', msg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Card>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {amountUsd != null ? (
          <Text style={[styles.cost, { color: colors.text }]}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountUsd)}
          </Text>
        ) : (
          <Text style={[styles.costNote, { color: colors.textSecondary }]}>
            Final fare and taxes appear in your approved booking tool — confirm there before expenses.
          </Text>
        )}
        <Text style={[styles.policyCopy, { color: colors.textSecondary }]}>
          {policyLabel(policyState)} · {policyHeadline}
        </Text>
        <View style={styles.badgeRow}>
          <StatusBadge variant="policy" value={policyState} />
        </View>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {policyState === 'within_policy'
            ? 'This screen is a frontend stub — no charges or real approvals occur here.'
            : 'Use alternatives or request approval through your official workflow. This build does not transmit payments.'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <PrimaryButton title="Confirm" onPress={() => void onConfirm()} loading={busy} />
        <SecondaryButton
          title="Request approval"
          onPress={() =>
            Alert.alert('Request sent', 'Your approver will be notified in the real system (stub).', [
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
  wrap: { flex: 1, padding: spacing.md, gap: spacing.lg },
  title: { fontSize: 20, fontWeight: '700' },
  cost: { fontSize: 28, fontWeight: '700', marginTop: spacing.sm },
  costNote: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm, fontWeight: '500' },
  policyCopy: { fontSize: 15, lineHeight: 22, marginTop: spacing.md },
  badgeRow: { marginTop: spacing.md },
  hint: { fontSize: 13, lineHeight: 18, marginTop: spacing.sm },
  actions: { gap: spacing.sm },
});
