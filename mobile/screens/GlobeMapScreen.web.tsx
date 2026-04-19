import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { TOKYO_GLOBE_FOCUS } from '../constants/tokyoLocations';

/** Tight bbox around Tokyo Station (Marunouchi). */
const OSM_MAP_URI =
  'https://www.openstreetmap.org/export/embed.html?bbox=139.758,35.676,139.776,35.687&layer=mapnik';

type Props = NativeStackScreenProps<RootStackParamList, 'GlobeMap'>;

export function GlobeMapScreen({ navigation }: Props) {
  const openExternal = () => {
    void Linking.openURL(
      `https://www.openstreetmap.org/#map=17/${TOKYO_GLOBE_FOCUS.latitude}/${TOKYO_GLOBE_FOCUS.longitude}`,
    );
  };

  return (
    <View style={styles.flex}>
      <WebView
        source={{ uri: OSM_MAP_URI }}
        style={StyleSheet.absoluteFill}
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
      />
      <SafeAreaView edges={['top']} style={styles.chrome}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.pill}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.pillText}>‹ Back</Text>
        </Pressable>
        <Pressable onPress={openExternal} style={styles.pill} accessibilityRole="button">
          <Text style={styles.pillAccent}>Open full map</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  chrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pillText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pillAccent: { color: '#9bd4ff', fontSize: 14, fontWeight: '700' },
});
