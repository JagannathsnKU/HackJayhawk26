import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Card } from '../components/Card';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';

type Props = NativeStackScreenProps<RootStackParamList, 'PackingList'>;

const GROUPS: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: 'Documents',
    items: [
      { id: 'p1', label: 'Passport / ID' },
      { id: 'p2', label: 'Corporate card + backup personal card' },
      { id: 'p3', label: 'Visa / ESTA screenshots offline' },
    ],
  },
  {
    title: 'Tech',
    items: [
      { id: 't1', label: 'Laptop + privacy screen' },
      { id: 't2', label: 'USB-C hub & international adapters' },
      { id: 't3', label: 'Noise-canceling headset' },
    ],
  },
  {
    title: 'Wellness',
    items: [
      { id: 'w1', label: 'Medications in original bottles' },
      { id: 'w2', label: 'Reusable water bottle' },
      { id: 'w3', label: 'Compact umbrella' },
    ],
  },
];

export function PackingListScreen({}: Props) {
  const colors = useAppTheme();
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setDone((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <NexusBrandLine />
      <Text style={[styles.pageTitle, { color: colors.text }]}>Packing</Text>

      {GROUPS.map((g) => (
        <Card key={g.title} style={{ gap: spacing.md }}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>{g.title}</Text>
          {g.items.map((it) => {
            const checked = Boolean(done[it.id]);
            return (
              <LiquidGlassPressable
                key={it.id}
                onPress={() => toggle(it.id)}
                variant={checked ? 'tileAccent' : 'tile'}
                minHeight={52}
                innerStyle={styles.rowInner}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <View
                  style={[
                    styles.box,
                    {
                      borderColor: colors.accent,
                      backgroundColor: checked ? colors.accent : 'transparent',
                    },
                  ]}
                >
                  {checked ? <Text style={styles.check}>✓</Text> : null}
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: colors.text, textDecorationLine: checked ? 'line-through' : 'none' },
                  ]}
                >
                  {it.label}
                </Text>
              </LiquidGlassPressable>
            );
          })}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingHorizontal: screenPaddingX, paddingTop: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  groupTitle: { fontSize: 16, fontWeight: '800' },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#041018', fontSize: 12, fontWeight: '900' },
  label: { fontSize: 15, fontWeight: '600', flex: 1 },
});
