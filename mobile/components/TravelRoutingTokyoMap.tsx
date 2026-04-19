import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { TOKYO_TRIP_PINS } from '../constants/tokyoLocations';

const MAP_HEIGHT = 280;

export function TravelRoutingTokyoMap() {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const coords = TOKYO_TRIP_PINS.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
    const t = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 40, right: 24, bottom: 32, left: 24 },
        animated: true,
      });
    }, 450);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 35.6765,
          longitude: 139.751,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {TOKYO_TRIP_PINS.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.title}
            description={p.description}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: MAP_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0a0a0f',
  },
  map: { flex: 1 },
});
