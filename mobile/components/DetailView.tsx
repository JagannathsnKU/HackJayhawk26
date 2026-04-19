import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ItineraryItem } from '../models/types';
import { spacing, useAppTheme } from '../utils/theme';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { useFormatters } from '../hooks/useFormatters';

type Props = {
  item: ItineraryItem;
  onModify: () => void;
  onReplace: () => void;
  onAlternatives: () => void;
};

export function DetailView({ item, onModify, onReplace, onAlternatives }: Props) {
  const colors = useAppTheme();
  const { policyLabel, currency } = useFormatters();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {item.subtitle}
      </Text>

      <View style={styles.rowMeta}>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {item.startTime}
          {item.endTime ? ` · ${item.endTime}` : ''}
        </Text>
      </View>
      <Text style={[styles.loc, { color: colors.textSecondary }]}>{item.location}</Text>

      <View style={styles.badges}>
        <StatusBadge variant="item" value={item.statusBadge} />
        <StatusBadge variant="policy" value={item.policyState} />
      </View>

      <View style={[styles.policyBox, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.policyTitle, { color: colors.text }]}>Policy</Text>
        <Text style={[styles.policyBody, { color: colors.textSecondary }]}>
          {policyLabel(item.policyState)}
          {item.vendorApproved ? ' · Approved vendor' : ' · Vendor review needed'}
        </Text>
      </View>

      {item.spendLimit > 0 ? (
        <ProgressBar current={item.spendAmount} max={item.spendLimit} label="Budget indicator" />
      ) : null}

      <View style={styles.bullets}>
        {item.detailBullets.map((b) => (
          <View key={b} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: colors.accent }]}>•</Text>
            <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Modify" onPress={onModify} />
        <SecondaryButton title="Replace" onPress={onReplace} />
        <SecondaryButton title="Get alternatives" onPress={onAlternatives} />
      </View>

      {item.spendAmount > 0 ? (
        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          Est. {currency(item.spendAmount)} — limits are indicative until policy sync completes.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  rowMeta: {
    marginTop: spacing.xs,
  },
  meta: {
    fontSize: 14,
    fontWeight: '500',
  },
  loc: {
    fontSize: 15,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  policyBox: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  policyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 22,
    width: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
  },
});
