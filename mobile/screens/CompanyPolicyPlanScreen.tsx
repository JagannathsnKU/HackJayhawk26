import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppProvider';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyPolicyPlan'>;

const AIRLINES = ['ANA', 'Japan Airlines', 'United', 'American', 'British Airways', 'Lufthansa Group'];
const HOTELS = ['Hotel New Otani', 'Westin (Marriott)', 'Sofitel', 'Hyatt Regency', 'IHG corporate program'];

export function CompanyPolicyPlanScreen({}: Props) {
  const colors = useAppTheme();
  const { services } = useAppState();
  const [limits, setLimits] = useState<Awaited<ReturnType<typeof services.policy.getLimits>> | null>(null);

  useEffect(() => {
    void (async () => {
      setLimits(await services.policy.getLimits());
    })();
  }, [services.policy]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.pageTitle, { color: colors.text }]}>Policy</Text>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.h, { color: colors.text }]}>Booking constraints</Text>
        {limits ? (
          <>
            <Row label="Default cabin" value="Economy (system default)" colors={colors} />
            <Row label="Business class" value={limits.businessClassRequiresApproval ? 'Requires approval' : 'Open'} colors={colors} />
            <Row label="Vendor policy" value={limits.onlyApprovedVendors ? 'Approved vendors only' : 'Flexible'} colors={colors} />
          </>
        ) : (
          <Text style={{ color: colors.textSecondary }}>Loading policy…</Text>
        )}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.h, { color: colors.text }]}>Allowed airlines (illustrative)</Text>
        {AIRLINES.map((a) => (
          <Text key={a} style={[styles.line, { color: colors.textSecondary }]}>
            · {a}
          </Text>
        ))}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.h, { color: colors.text }]}>Preferred hotels</Text>
        {HOTELS.map((h) => (
          <Text key={h} style={[styles.line, { color: colors.textSecondary }]}>
            · {h}
          </Text>
        ))}
      </Card>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  h: { fontSize: 17, fontWeight: '800' },
  line: { fontSize: 14, lineHeight: 20 },
});
