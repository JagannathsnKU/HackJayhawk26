import * as React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { screenPaddingX } from '../../utils/theme';

export type VoiceAgentFabProps = {
  accent: string;
  text: string;
  textMuted: string;
  onAccent: string;
};

/**
 * Bottom-right voice entry: expands to a centered fullscreen session with a reactive orb.
 * ElevenLabs / server wiring can replace the metering simulation later.
 */
export function VoiceAgentFab({ accent, text, textMuted, onAccent }: VoiceAgentFabProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = React.useState(false);
  const [hint, setHint] = React.useState('Tap the orb area · speak naturally');
  const [orbScale, setOrbScale] = React.useState(1);
  const meteringRef = React.useRef(0);
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const simSpeakingRef = React.useRef(false);

  const stopRecording = React.useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
    } catch {
      /* noop */
    }
  }, []);

  const startRecording = React.useCallback(async () => {
    if (Platform.OS === 'web') {
      setHint('Listening (visual demo on web)');
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setHint('Microphone permission needed for reactive orb');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.caf',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      await rec.startAsync();
      recordingRef.current = rec;
      setHint('Listening…');
    } catch {
      setHint('Could not start mic — showing idle motion');
    }
  }, []);

  const pollMetering = React.useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      const s = await rec.getStatusAsync();
      if (s.isRecording && 'metering' in s && typeof s.metering === 'number' && !Number.isNaN(s.metering)) {
        const db = s.metering;
        meteringRef.current = Math.min(1, Math.max(0, (db + 55) / 55));
        return;
      }
    } catch {
      /* noop */
    }
    meteringRef.current = Math.min(1, Math.max(0, meteringRef.current * 0.92));
  }, []);

  React.useEffect(() => {
    if (!open) {
      simSpeakingRef.current = false;
      void stopRecording();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    void startRecording();

    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;

      void pollMetering();

      const breath = 1 + 0.045 * Math.sin(now / 420);
      const sim = simSpeakingRef.current ? 0.18 * Math.sin(now / 160) : 0;
      const webSim =
        Platform.OS === 'web' ? 0.12 + 0.1 * Math.sin(now / 240) + 0.08 * Math.sin(now / 900) : 0;
      const m = Platform.OS === 'web' ? webSim : meteringRef.current;
      const target = breath + m * 0.32 + sim;
      setOrbScale((prev) => prev + (target - prev) * Math.min(1, dt * 10));

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      void stopRecording();
    };
  }, [open, pollMetering, startRecording, stopRecording]);

  const simulateAgentSpeaking = React.useCallback(() => {
    simSpeakingRef.current = true;
    setHint('Agent speaking… (demo pulse)');
    setTimeout(() => {
      simSpeakingRef.current = false;
      setHint('Listening…');
    }, 3200);
  }, []);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.fab,
          {
            bottom: Math.max(insets.bottom, 12) + 8,
            right: screenPaddingX,
            backgroundColor: accent,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open voice assistant"
      >
        <Ionicons name="mic" size={26} color={onAccent} />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <LinearGradient colors={['#0b1538', '#0a0f1a', '#000000']} style={styles.modalRoot}>
          <Pressable
            style={[styles.closeBtn, { top: insets.top + 8, right: Math.max(insets.right, 16) }]}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close voice assistant"
          >
            <Ionicons name="close" size={28} color={text} />
          </Pressable>

          <View style={[styles.orbColumn, { maxHeight: height * 0.72 }]}>
            <Text style={[styles.title, { color: text }]}>Voice</Text>
            <Text style={[styles.sub, { color: textMuted }]}>{hint}</Text>

            <View style={[styles.orbHit, { width: width * 0.72, height: width * 0.72, maxWidth: 320, maxHeight: 320 }]}>
              <View
                style={[
                  styles.glow,
                  {
                    transform: [{ scale: orbScale }],
                    borderColor: accent,
                    shadowColor: accent,
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(56,189,248,0.35)', 'rgba(0,93,255,0.25)', 'rgba(15,23,42,0.9)']}
                  style={styles.glowInner}
                />
              </View>
            </View>

            <Pressable
              onPress={simulateAgentSpeaking}
              style={[styles.demoBtn, { borderColor: accent }]}
              accessibilityRole="button"
              accessibilityLabel="Simulate agent speaking animation"
            >
              <Text style={[styles.demoBtnText, { color: accent }]}>Simulate reply pulse</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    zIndex: 40,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    zIndex: 10,
    padding: 10,
  },
  orbColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  orbHit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: '68%',
    height: '68%',
    borderRadius: 9999,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOpacity: 0.55,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  glowInner: {
    flex: 1,
    borderRadius: 9999,
  },
  demoBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
