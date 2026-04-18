import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { AppNotification } from '../models/types';
import { useAppState } from '../context/AppProvider';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { Card } from '../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({}: Props) {
  const colors = useAppTheme();
  const { notifications } = useAppState();

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Card
      style={[
        styles.row,
        !item.read ? { borderColor: colors.accent, borderWidth: StyleSheet.hairlineWidth } : undefined,
      ]}
    >
      <View style={styles.textWrap}>
        {item.agent ? (
          <View style={[styles.agentTag, { backgroundColor: colors.accentMuted }]}>
            <Text style={[styles.agentTagText, { color: colors.accent }]}>
              {item.agent === 'scout' ? 'Scout · Agent A' : 'Treasurer · Agent B'}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text>
      </View>
      <Text style={[styles.time, { color: colors.textMuted }]}>{item.timeLabel}</Text>
    </Card>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(n) => n.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListHeaderComponent={
        <Text style={[styles.header, { color: colors.textSecondary }]}>
          Calm updates — no alarm tones, just what matters.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: { marginBottom: spacing.md, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  textWrap: { flex: 1, gap: 6 },
  agentTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  agentTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 12, fontWeight: '600' },
});
