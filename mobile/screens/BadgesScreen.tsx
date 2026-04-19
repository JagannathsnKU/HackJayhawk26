import React, { useCallback, useEffect, useState } from 'react';
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
import { backendFetch } from '../services/apiClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

type PhotoItem = { id: string; uri?: string; label: string };

type SolanaNft = {
  booking_id: string;
  city: string;
  type: string;
  amount_xrp: number | null;
  xrpl_tx_hash: string | null;
  mint_address: string | null;
  explorer_url: string | null;
  timestamp: string;
};

type Booking = {
  booking_id: string;
  type: string;
  city: string;
  date: string;
  amount_xrp: number;
  xrpl_tx_hash: string;
  timestamp: string;
};

export function BadgesScreen({}: Props) {
  const colors = useAppTheme();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [nfts, setNfts] = useState<SolanaNft[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(true);

  useEffect(() => {
    // Fetch Solana NFTs (minted on each confirmed booking)
    backendFetch('/solana/nfts')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { nfts: SolanaNft[] };
        setNfts(d.nfts ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingNfts(false));

    // Fetch real bookings from memory for the archive
    backendFetch('/memory')
      .then((r) => r.json())
      .then((data) => {
        const d = data as { recent_bookings?: Booking[] };
        setBookings(d.recent_bookings ?? []);
      })
      .catch(() => {});
  }, []);

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

        {/* Solana NFT badges — one per confirmed booking destination */}
        <Text style={[styles.section, { color: colors.textMuted }]}>
          {loadingNfts ? 'Loading NFT badges…' : nfts.length > 0 ? `Destination NFTs · ${nfts.length} minted on Solana` : 'No NFT badges yet — book a trip to mint one'}
        </Text>

        <View style={{ gap: spacing.sm }}>
          {nfts.length > 0 ? (
            nfts.map((nft) => (
              <View
                key={nft.booking_id}
                style={[styles.badgeCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={[styles.badgeTitle, { color: colors.text }]}>
                  {nft.city} · {nft.type}
                </Text>
                <Text style={[styles.badgeMeta, { color: colors.textMuted }]}>
                  {nft.amount_xrp != null ? `${nft.amount_xrp} XRP` : '—'}
                  {nft.mint_address ? ` · NFT: ${nft.mint_address.slice(0, 8)}…` : ''}
                </Text>
                {nft.xrpl_tx_hash ? (
                  <Text style={[styles.badgeTx, { color: colors.textMuted }]} selectable>
                    XRPL: {nft.xrpl_tx_hash.slice(0, 20)}…
                  </Text>
                ) : null}
              </View>
            ))
          ) : !loadingNfts ? (
            // Placeholder until first booking is made
            <View style={[styles.badgeCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.badgeTitle, { color: colors.textMuted }]}>Your first destination badge will appear here</Text>
            </View>
          ) : null}
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

        {/* Archive — real bookings from XRPL memory */}
        <Text style={[styles.section, { color: colors.textMuted }]}>Archive</Text>
        {bookings.length > 0 ? (
          bookings.map((b) => (
            <Text key={b.booking_id} style={[styles.archiveLine, { color: colors.textSecondary }]}>
              · {b.city} {b.type} · {b.amount_xrp} XRP · {b.date}
            </Text>
          ))
        ) : (
          <Text style={[styles.archiveLine, { color: colors.textMuted }]}>No bookings yet.</Text>
        )}
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
  badgeCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, gap: 4 },
  badgeTitle: { fontSize: 16, fontWeight: '800' },
  badgeMeta: { fontSize: 13 },
  badgeTx: { fontSize: 11, fontFamily: 'monospace' },
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
