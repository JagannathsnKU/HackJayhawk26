import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import type { MainTabScreenProps } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppProvider';
import { radii, screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = MainTabScreenProps<'ProfileTab'>;

type ModuleId = 'did' | 'info' | 'balances' | 'send';

const MODULES: { id: ModuleId; label: string; hint: string }[] = [
  { id: 'did', label: 'DID', hint: 'XLS-40 identity' },
  { id: 'info', label: 'You', hint: 'HR profile' },
  { id: 'balances', label: 'Ledger', hint: 'RLUSD · XRP' },
  { id: 'send', label: 'Send', hint: 'Transfers' },
];

export function ProfileScreen({}: Props) {
  const colors = useAppTheme();
  const { signOut, user: authUser } = useAuth();
  const { user, loading, wallet } = useAppState();
  const [active, setActive] = useState<ModuleId>('did');
  const [sendAmount, setSendAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [sendAsset, setSendAsset] = useState<'RLUSD' | 'XRP'>('RLUSD');
  const [sendBusy, setSendBusy] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }));
  }, [signOut]);

  const shortDid = wallet.did.length > 24 ? `${wallet.did.slice(0, 18)}…${wallet.did.slice(-10)}` : wallet.did;

  const copyDid = useCallback(() => {
    Alert.alert('Demo', 'On device, DID would copy to clipboard for verifiable presentation flows.');
  }, []);

  const submitSend = useCallback(() => {
    const n = parseFloat(sendAmount.replace(/,/g, ''));
    if (!destination.trim()) {
      Alert.alert('Destination required', 'Enter a destination address or account.');
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive number.');
      return;
    }
    setSendBusy(true);
    setTimeout(() => {
      setSendBusy(false);
      Alert.alert(
        'Signed (demo)',
        `Prepared ${sendAsset} transfer of ${sendAmount} for XRPL submission. Secure signing (TEE) would apply in production.`,
      );
      setSendAmount('');
      setDestination('');
    }, 900);
  }, [destination, sendAmount, sendAsset]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.top}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Identity & treasury</Text>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Choose a module — one surface at a time instead of one endless page.
        </Text>
        {authUser ? (
          <Text style={[styles.authEmail, { color: colors.textMuted }]}>App login: {authUser.email}</Text>
        ) : null}
      </View>

      <View style={styles.hub}>
        {MODULES.map((m) => {
          const on = active === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setActive(m.id)}
              style={[
                styles.hubTile,
                {
                  borderColor: on ? colors.accent : colors.border,
                  backgroundColor: on ? colors.accentMuted : colors.surfaceElevated,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.hubLabel, { color: on ? colors.accent : colors.text }]}>{m.label}</Text>
              <Text style={[styles.hubHint, { color: colors.textMuted }]}>{m.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.panelScroll}
        contentContainerStyle={styles.panelScrollInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader
          title={MODULES.find((m) => m.id === active)?.label ?? ''}
          subtitle={
            active === 'did'
              ? 'Present proofs, not raw PII.'
              : active === 'info'
                ? 'Corporate directory (mock).'
                : active === 'balances'
                  ? 'Escrow & vault headroom.'
                  : 'Build a signed transfer intent.'
          }
        />
        {active === 'did' ? (
          <Card>
            <Text style={[styles.label, { color: colors.textMuted }]}>Decentralized ID</Text>
            <Text style={[styles.mono, { color: colors.text }]} selectable>
              {shortDid}
            </Text>
            <Pressable onPress={copyDid} style={styles.linkRow} accessibilityRole="button">
              <Text style={[styles.link, { color: colors.accent }]}>Copy / verify (demo)</Text>
            </Pressable>
          </Card>
        ) : null}

        {active === 'info' ? (
          <Card>
            {loading || !user ? (
              <Text style={{ color: colors.textSecondary }}>Loading…</Text>
            ) : (
              <View style={styles.kv}>
                <Row label="Name" value={user.displayName} colors={colors} />
                <Row label="Employee ID" value={user.employeeId} colors={colors} />
                <Row label="Department" value={user.department} colors={colors} />
                <Row label="Home airport" value={user.homeAirport} colors={colors} />
              </View>
            )}
          </Card>
        ) : null}

        {active === 'balances' ? (
          <Card>
            <View style={styles.kv}>
              <Row label="RLUSD" value={wallet.rlusdBalance} colors={colors} emphasize />
              <Row label="XRP" value={wallet.xrpBalance} colors={colors} emphasize />
              <Row label="Trip escrow (USD)" value={`$${wallet.tripEscrowUsd}`} colors={colors} />
              <Row label="XLS-66 vault available" value={`$${wallet.lendingVaultAvailableUsd}`} colors={colors} />
            </View>
          </Card>
        ) : null}

        {active === 'send' ? (
          <Card>
            <Text style={[styles.label, { color: colors.textMuted }]}>Token</Text>
            <View style={styles.tokenRow}>
              {(['RLUSD', 'XRP'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setSendAsset(t)}
                  style={[
                    styles.tokenChip,
                    {
                      backgroundColor: sendAsset === t ? colors.accentMuted : colors.surfaceElevated,
                      borderColor: sendAsset === t ? colors.accent : colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sendAsset === t }}
                >
                  <Text style={[styles.tokenChipText, { color: sendAsset === t ? colors.accent : colors.text }]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.textMuted, marginTop: spacing.md }]}>Amount</Text>
            <TextInput
              value={sendAmount}
              onChangeText={setSendAmount}
              placeholder="e.g. 150"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
            />
            <Text style={[styles.label, { color: colors.textMuted, marginTop: spacing.md }]}>Destination</Text>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated },
              ]}
            />
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton title="Prepare transfer (demo)" onPress={submitSend} loading={sendBusy} />
            </View>
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing.md }}>
          <SectionHeader title="App session" subtitle="JWT auth for this app — not your on-chain identity." />
          <SecondaryButton title="Sign out" onPress={() => void handleSignOut()} />
        </Card>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          DIDTokenCreate & signing hook to your XRPL environment in production.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
  emphasize,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useAppTheme>;
  emphasize?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[emphasize ? styles.rowValueBig : styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md },
  panelScroll: { flex: 1 },
  panelScrollInner: { paddingHorizontal: screenPaddingX, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 4, letterSpacing: -0.4 },
  sub: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  authEmail: { fontSize: 13, marginTop: spacing.sm, fontWeight: '500' },
  hub: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  hubTile: {
    width: '47%',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  hubLabel: { fontSize: 18, fontWeight: '700' },
  hubHint: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  mono: { fontSize: 13, lineHeight: 20 },
  linkRow: { alignSelf: 'flex-start', marginTop: spacing.sm },
  link: { fontSize: 15, fontWeight: '600' },
  kv: { gap: spacing.md },
  row: { gap: 4 },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 16, fontWeight: '600' },
  rowValueBig: { fontSize: 20, fontWeight: '700' },
  tokenRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  tokenChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tokenChipText: { fontSize: 15, fontWeight: '600' },
  input: {
    marginTop: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  footer: { marginTop: spacing.lg, fontSize: 12, textAlign: 'center' },
});
