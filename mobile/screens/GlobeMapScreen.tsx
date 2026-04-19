import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { TOKYO_GLOBE_FOCUS } from '../constants/tokyoLocations';

type Props = NativeStackScreenProps<RootStackParamList, 'GlobeMap'>;

export function GlobeMapScreen({ navigation }: Props) {
  const openExternal = () => {
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${TOKYO_GLOBE_FOCUS.latitude},${TOKYO_GLOBE_FOCUS.longitude}`,
    );
  };

  const coord = {
    latitude: TOKYO_GLOBE_FOCUS.latitude,
    longitude: TOKYO_GLOBE_FOCUS.longitude,
  };

  return (
    <View style={styles.flex}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: TOKYO_GLOBE_FOCUS.latitude,
          longitude: TOKYO_GLOBE_FOCUS.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker coordinate={coord} title={TOKYO_GLOBE_FOCUS.title} description={TOKYO_GLOBE_FOCUS.description} />
      </MapView>
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
          <Text style={styles.pillAccent}>Open in Maps</Text>
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
