import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { TravelHistoryMap } from '../components/TravelHistoryMap';
import { NexusBrandLine } from '../components/NexusBrandLine';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';
import { SAMPLE_ITINERARIES } from '../utils/sampleItineraries';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

type PhotoItem = { id: string; uri?: string; label: string };

const BADGES = [
  { id: 'b1', label: 'Pacific rim commuter' },
  { id: 'b2', label: 'Policy perfect streak' },
  { id: 'b3', label: 'Carbon aware traveler' },
];

export function BadgesScreen({}: Props) {
  const colors = useAppTheme();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const addFromLibrary = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Allow library access to attach a memory.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (r.canceled || !r.assets?.[0]) return;
    const a = r.assets[0];
    setPhotos((p) => [...p, { id: `img-${Date.now()}`, uri: a.uri, label: a.fileName ?? 'Photo' }]);
  }, []);

  const addFromFiles = useCallback(async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
      base64: false,
    });
    if (r.canceled) return;
    const a = r.assets[0];
    setPhotos((p) => [...p, { id: `doc-${Date.now()}`, uri: a.uri, label: a.name }]);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <NexusBrandLine />
        <Text style={[styles.title, { color: colors.text }]}>Badges</Text>

        <View style={{ gap: spacing.sm }}>
          {BADGES.map((b) => (
            <View
              key={b.id}
              style={[styles.badgeCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.badgeTitle, { color: colors.text }]}>{b.label}</Text>
            </View>
          ))}
        </View>

        <TravelHistoryMap />

        <Text style={[styles.section, { color: colors.textMuted }]}>Photos</Text>
        <View style={styles.pickRow}>
          <LiquidGlassPressable
            onPress={() => void addFromLibrary()}
            variant="tileAccent"
            minHeight={48}
            pressableStyle={styles.pickFlex}
            innerStyle={styles.pickInner}
          >
            <Text style={[styles.pickBtnText, { color: colors.text }]}>Library</Text>
          </LiquidGlassPressable>
          <LiquidGlassPressable
            onPress={() => void addFromFiles()}
            variant="tile"
            minHeight={48}
            pressableStyle={styles.pickFlex}
            innerStyle={styles.pickInner}
          >
            <Text style={[styles.pickBtnText, { color: colors.text }]}>Files</Text>
          </LiquidGlassPressable>
        </View>

        <View style={styles.photoRow}>
          {photos.map((p) => (
            <View key={p.id} style={[styles.photoCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              {p.uri ? (
                <Image source={{ uri: p.uri }} style={styles.phImage} resizeMode="cover" />
              ) : (
                <View style={[styles.phStub, { backgroundColor: colors.accentMuted }]} />
              )}
              <Text style={[styles.phCap, { color: colors.textSecondary }]} numberOfLines={2}>
                {p.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Archive</Text>
        {SAMPLE_ITINERARIES.map((s) => (
          <Text key={s.id} style={[styles.archiveLine, { color: colors.textSecondary }]}>
            · {s.title}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800' },
  badgeCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md },
  badgeTitle: { fontSize: 16, fontWeight: '800' },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  pickRow: { flexDirection: 'row', gap: spacing.sm },
  pickFlex: { flex: 1 },
  pickInner: { paddingVertical: 10, paddingHorizontal: spacing.md },
  pickBtnText: { fontSize: 14, fontWeight: '800' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoCard: { width: '47%', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  phImage: { width: '100%', height: 96 },
  phStub: { height: 96 },
  phCap: { fontSize: 12, padding: spacing.sm, minHeight: 36 },
  archiveLine: { fontSize: 14, lineHeight: 22 },
});
