import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { TOKYO_TRIP_PINS } from '../constants/tokyoLocations';

const MAP_HEIGHT = 280;

function buildLeafletHtml() {
  const pins = TOKYO_TRIP_PINS.map((p) => ({
    lat: p.latitude,
    lng: p.longitude,
    title: p.title.replace(/'/g, '&#39;'),
    desc: p.description.replace(/'/g, '&#39;'),
  }));
  const json = JSON.stringify(pins);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>html,body,#m{margin:0;height:100%;width:100%;}</style>
</head>
<body>
  <div id="m"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function(){
      var pins = ${json};
      var map = L.map('m', { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      pins.forEach(function(p) {
        L.marker([p.lat, p.lng]).bindPopup('<b>' + p.title + '</b><br/>' + p.desc).addTo(map);
      });
      var latlngs = pins.map(function(p){ return [p.lat, p.lng]; });
      map.fitBounds(L.latLngBounds(latlngs), { padding: [28, 28], maxZoom: 14 });
    })();
  </script>
</body>
</html>`;
}

export function TravelRoutingTokyoMap() {
  const html = useMemo(() => buildLeafletHtml(), []);

  return (
    <View style={styles.wrap}>
      <WebView
        source={{ html }}
        style={styles.web}
        originWhitelist={['*']}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
      />
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
  web: { flex: 1 },
});
