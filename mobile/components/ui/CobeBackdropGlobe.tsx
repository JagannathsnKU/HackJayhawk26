import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COBE_BACKDROP_WEBVIEW_HTML } from './cobe-globe-html';
import type { CobeBackdropGlobeProps } from './CobeBackdropGlobe.types';

/**
 * COBE globe in a WebView for use behind UI. Does not capture touches.
 */
export function CobeBackdropGlobe({ style }: CobeBackdropGlobeProps) {
  const source = useMemo(
    () => ({
      html: COBE_BACKDROP_WEBVIEW_HTML,
      baseUrl: 'https://esm.sh',
    }),
    [],
  );

  return (
    <View style={[styles.fill, style]} pointerEvents="none" collapsable={false}>
      <WebView
        pointerEvents="none"
        source={source}
        style={styles.webview}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        setSupportMultipleWindows={false}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        androidLayerType="hardware"
        mixedContentMode="always"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setBuiltInZoomControls={false}
        {...(Platform.OS === 'ios' ? { allowsBackForwardNavigationGestures: false } : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#030508',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    opacity: 1,
  },
});
