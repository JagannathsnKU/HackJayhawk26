import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppProvider';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { backendFetch } from '../services/apiClient';

type Props = RootStackScreenProps<'Profile'>;

type ModuleId = 'did' | 'docs' | 'info' | 'balances' | 'send';

const MODULES: { id: ModuleId; label: string; hint: string }[] = [
  { id: 'did', label: 'DID', hint: 'XLS-40' },
  { id: 'docs', label: 'Travel IDs', hint: 'Passport · DL' },
  { id: 'info', label: 'You', hint: 'HR' },
  { id: 'balances', label: 'Ledger', hint: 'RLUSD' },
  { id: 'send', label: 'Send', hint: 'Transfers' },
];

export function ProfileScreen({}: Props) {
  const colors = useAppTheme();
  const { signOut } = useAuth();
  const { user, loading, wallet } = useAppState();
  const [active, setActive] = useState<ModuleId>('did');
  const [sendAmount, setSendAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [sendAsset, setSendAsset] = useState<'RLUSD' | 'XRP'>('RLUSD');
  const [sendBusy, setSendBusy] = useState(false);

  // XLS-40: real DID + Verifiable Presentation from agent hot wallet
  const [realDid, setRealDid] = useState<string | null>(null);
  const [vpStatus, setVpStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [vpProof, setVpProof] = useState<string | null>(null);

  // XLS network check for balances tab
  const [networkInfo, setNetworkInfo] = useState<Record<string, unknown> | null>(null);
  const [networkLoading, setNetworkLoading] = useState(false);

  // Fetch real DID on mount
  useEffect(() => {
    backendFetch('/identity/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge: 'nexus-app-session',
        domain: 'nexus-ledger.local',
        credential_issuer_did: 'did:example:lockton',
        employee_label: 'Nexus Traveler',
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const d = data as Record<string, unknown>;
        if (d.did) setRealDid(d.did as string);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }));
  }, [signOut]);

  const displayDid = realDid ?? wallet.did;
  const shortDid = displayDid.length > 24 ? `${displayDid.slice(0, 18)}…${displayDid.slice(-10)}` : displayDid;

  // "Verify & sign VP" → triggers real XLS-40 VP signing
  const verifyIdentity = useCallback(async () => {
    setVpStatus('loading');
    try {
      const res = await backendFetch('/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: `nexus-verify-${Date.now()}`,
          domain: 'nexus-ledger.local',
          credential_issuer_did: 'did:example:lockton',
          employee_label: 'Nexus Traveler',
        }),
      });
      if (!res.ok) {
        // Parse the backend error detail instead of showing a generic message
        let detail = `HTTP ${res.status}`;
        try {
          const errBody = (await res.json()) as Record<string, unknown>;
          detail = (errBody.detail as string) ?? detail;
        } catch { /* ignore parse errors */ }
        setVpStatus('error');
        Alert.alert('Identity error', detail);
        return;
      }
      const data = (await res.json()) as Record<string, unknown>;
      const did = data.did as string;
      const presentation = data.presentation as Record<string, unknown>;
      const proofValue = ((presentation?.proof as Record<string, unknown>)?.jws as string) ?? '';
      setRealDid(did);
      setVpProof(proofValue.slice(0, 32) + '…');
      setVpStatus('ok');
      Alert.alert(
        'Identity verified (XLS-40)',
        `DID: ${did}\n\nVerifiable Presentation signed.\nProof: ${proofValue.slice(0, 24)}…`,
      );
    } catch (err) {
      setVpStatus('error');
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Identity error', msg);
    }
  }, []);

  // Fetch XRPL network account info for balances tab
  const fetchNetworkInfo = useCallback(async () => {
    if (!realDid) return;
    setNetworkLoading(true);
    try {
      // Extract XRPL classic address from DID (did:xrpl:1:<network>:<address>)
      const parts = realDid.split(':');
      const address = parts[parts.length - 1];
      const res = await backendFetch(`/xrpl/network-check/${address}`);
      if (res.ok) {
        setNetworkInfo((await res.json()) as Record<string, unknown>);
      }
    } catch {
      // fallback to mock wallet data
    } finally {
      setNetworkLoading(false);
    }
  }, [realDid]);

  useEffect(() => {
    if (active === 'balances') void fetchNetworkInfo();
  }, [active, fetchNetworkInfo]);

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
        'Transfer prepared',
        `Prepared ${sendAsset} transfer of ${sendAmount} for XRPL submission. Secure signing (TEE) applies when your wallet is fully provisioned.`,
      );
      setSendAmount('');
      setDestination('');
    }, 900);
  }, [destination, sendAmount, sendAsset]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <View style={styles.top}>
        <NexusBrandLine />
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Profile</Text>
        <Text style={[styles.title, { color: colors.text }]}>Identity & wallet</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Pick a card below.</Text>
      </View>

      <View style={styles.hub}>
        {MODULES.map((m) => {
          const on = active === m.id;
          return (
            <LiquidGlassPressable
              key={m.id}
              onPress={() => setActive(m.id)}
              variant={on ? 'chipActive' : 'chip'}
              minHeight={56}
              pressableStyle={styles.hubTilePress}
              innerStyle={styles.hubTileInner}
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.hubLabel, { color: colors.text }]}>{m.label}</Text>
              <Text style={[styles.hubHint, { color: colors.textMuted }]}>{m.hint}</Text>
            </LiquidGlassPressable>
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
              : active === 'docs'
                ? 'Uploads bind to your DID for XLS identity checks when vault storage is enabled.'
                : active === 'info'
                  ? 'Corporate directory snapshot.'
                  : active === 'balances'
                    ? 'Escrow & vault headroom.'
                    : 'Build a signed transfer intent.'
          }
        />

        {active === 'did' ? (
          <Card>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Decentralized ID {realDid ? '· Live (XLS-40)' : '· Resolving…'}
            </Text>
            <Text style={[styles.mono, { color: colors.text }]} selectable>
              {shortDid}
            </Text>
            {vpProof ? (
              <Text style={[styles.vpProof, { color: colors.textMuted }]} selectable>
                VP proof: {vpProof}
              </Text>
            ) : null}
            <LiquidGlassPressable
              onPress={() => void verifyIdentity()}
              variant="secondary"
              minHeight={44}
              pressableStyle={{ alignSelf: 'flex-start' }}
              innerStyle={styles.linkRowInner}
            >
              <Text style={[styles.link, { color: colors.text }]}>
                {vpStatus === 'loading' ? 'Signing…' : vpStatus === 'ok' ? 'Re-verify' : 'Verify & sign VP'}
              </Text>
            </LiquidGlassPressable>
          </Card>
        ) : null}

        {active === 'docs' ? (
          <Card style={{ gap: spacing.sm }}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Travel documents</Text>
            <Text style={[styles.docHint, { color: colors.textSecondary }]}>
              Encrypted vault and verifiable credentials when your organization enables document services.
            </Text>
            <SecondaryButton
              title="Passport"
              onPress={() => Alert.alert('Nexus', 'MRZ scan and verifiable credential attachment run when document capture is enabled.')}
            />
            <SecondaryButton
              title="Driver license"
              onPress={() => Alert.alert('Nexus', 'OCR for policy age and ID checks runs when document capture is enabled.')}
            />
            <SecondaryButton
              title="Visa / entry docs"
              onPress={() => Alert.alert('Nexus', 'Encrypted copies for border workflows store when your vault is configured.')}
            />
            <SecondaryButton
              title="Trusted traveler / Global Entry"
              onPress={() => Alert.alert('Nexus', 'PASS ID metadata links to your profile when trusted-traveler integration is on.')}
            />
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
              {networkLoading ? (
                <Text style={{ color: colors.textSecondary }}>Checking XRPL networks…</Text>
              ) : networkInfo ? (
                <>
                  {Object.entries(networkInfo).map(([net, info]) => {
                    const i = info as Record<string, unknown>;
                    return (
                      <Row
                        key={net}
                        label={net.replace(/_/g, ' ')}
                        value={i.found ? `Found · seq ${i.Sequence ?? '—'}` : 'Not funded'}
                        colors={colors}
                      />
                    );
                  })}
                </>
              ) : (
                <>
                  <Row label="RLUSD" value={wallet.rlusdBalance} colors={colors} emphasize />
                  <Row label="XRP" value={wallet.xrpBalance} colors={colors} emphasize />
                  <Row label="Trip escrow (USD)" value={`$${wallet.tripEscrowUsd}`} colors={colors} />
                  <Row label="XLS-66 vault available" value={`$${wallet.lendingVaultAvailableUsd}`} colors={colors} />
                </>
              )}
            </View>
          </Card>
        ) : null}

        {active === 'send' ? (
          <Card>
            <Text style={[styles.label, { color: colors.textMuted }]}>Token</Text>
            <View style={styles.tokenRow}>
              {(['RLUSD', 'XRP'] as const).map((t) => (
                <LiquidGlassPressable
                  key={t}
                  onPress={() => setSendAsset(t)}
                  variant={sendAsset === t ? 'chipActive' : 'chip'}
                  minHeight={40}
                  pressableStyle={styles.tokenChipWrap}
                  innerStyle={styles.tokenChipInner}
                  accessibilityState={{ selected: sendAsset === t }}
                >
                  <Text style={[styles.tokenChipText, { color: colors.text }]}>{t}</Text>
                </LiquidGlassPressable>
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
              <PrimaryButton title="Prepare transfer" onPress={submitSend} loading={sendBusy} />
            </View>
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing.md }}>
          <SectionHeader title="App session" subtitle="On-chain identity is separate from your app session." />
          <SecondaryButton title="Sign out" onPress={() => void handleSignOut()} />
        </Card>

        <Text style={[styles.footer, { color: colors.textMuted }]}>Nexus · XRPL-ready identity</Text>
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
  hub: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  hubTilePress: { width: '47%' },
  hubTileInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 4,
    alignItems: 'flex-start',
  },
  hubLabel: { fontSize: 18, fontWeight: '700' },
  hubHint: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  mono: { fontSize: 13, lineHeight: 20 },
  vpProof: { fontSize: 11, lineHeight: 16, marginTop: 4, fontFamily: 'monospace' },
  linkRowInner: { marginTop: spacing.sm, paddingVertical: 10, paddingHorizontal: spacing.md },
  link: { fontSize: 15, fontWeight: '600' },
  kv: { gap: spacing.md },
  row: { gap: 4 },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 16, fontWeight: '600' },
  rowValueBig: { fontSize: 20, fontWeight: '700' },
  tokenRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  tokenChipWrap: { flex: 1 },
  tokenChipInner: { paddingVertical: 8, paddingHorizontal: spacing.md },
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
  docHint: { fontSize: 14, lineHeight: 20 },
});
