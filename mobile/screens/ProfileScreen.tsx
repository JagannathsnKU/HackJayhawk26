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
import type { MainTabScreenProps } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionHeader } from '../components/SectionHeader';

type Props = MainTabScreenProps<'ProfileTab'>;

export function ProfileScreen({}: Props) {
  const colors = useAppTheme();
  const { user, loading, wallet } = useAppState();
  const [sendAmount, setSendAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [token, setToken] = useState<'RLUSD' | 'XRP'>('RLUSD');
  const [sendBusy, setSendBusy] = useState(false);

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
        `Prepared ${token} transfer of ${sendAmount} for XRPL submission. Companion TEE would co-sign in production.`,
      );
      setSendAmount('');
      setDestination('');
    }, 900);
  }, [destination, sendAmount, token]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Identity & treasury</Text>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          XLS-40 DID, balances, and outbound transfers (mocked for the hackathon demo).
        </Text>

        <View style={styles.section}>
          <SectionHeader title="Decentralized ID" subtitle="W3C DID on XRPL — present proofs, not raw PII." />
          <Card>
            <Text style={[styles.label, { color: colors.textMuted }]}>DID</Text>
            <Text style={[styles.mono, { color: colors.text }]} selectable>
              {shortDid}
            </Text>
            <Pressable
              onPress={copyDid}
              style={[styles.linkRow, { marginTop: spacing.sm }]}
              accessibilityRole="button"
              accessibilityLabel="Copy DID"
            >
              <Text style={[styles.link, { color: colors.accent }]}>Copy / verify (demo)</Text>
            </Pressable>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Your info" subtitle="Synced from corporate HR (mock)." />
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
        </View>

        <View style={styles.section}>
          <SectionHeader title="On-ledger balances" subtitle="RLUSD, XRP, trip escrow, lending headroom." />
          <Card>
            <View style={styles.kv}>
              <Row label="RLUSD" value={wallet.rlusdBalance} colors={colors} emphasize />
              <Row label="XRP" value={wallet.xrpBalance} colors={colors} emphasize />
              <Row label="Trip escrow (USD)" value={`$${wallet.tripEscrowUsd}`} colors={colors} />
              <Row label="XLS-66 vault available" value={`$${wallet.lendingVaultAvailableUsd}`} colors={colors} />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Send tokens" subtitle="Demo only — builds a signed intent for the ledger." />
          <Card>
            <Text style={[styles.label, { color: colors.textMuted }]}>Token</Text>
            <View style={styles.tokenRow}>
              {(['RLUSD', 'XRP'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setToken(t)}
                  style={[
                    styles.tokenChip,
                    {
                      backgroundColor: token === t ? colors.accentMuted : colors.surfaceElevated,
                      borderColor: token === t ? colors.accent : colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: token === t }}
                >
                  <Text style={[styles.tokenChipText, { color: token === t ? colors.accent : colors.text }]}>
                    {t}
                  </Text>
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
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            />
            <Text style={[styles.label, { color: colors.textMuted, marginTop: spacing.md }]}>Destination</Text>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            />
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton title="Prepare transfer (demo)" onPress={submitSend} loading={sendBusy} />
            </View>
          </Card>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          DIDTokenCreate & real signing would run against your testnet / mainnet config.
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
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 4, letterSpacing: -0.4 },
  sub: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  mono: { fontSize: 13, lineHeight: 20 },
  linkRow: { alignSelf: 'flex-start' },
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
