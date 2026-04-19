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
import WebView from 'react-native-webview';
import { screenPaddingX } from '../../utils/theme';

const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? '';
const CONVAI_EMBED_URL = process.env.EXPO_PUBLIC_CONVAI_EMBED_URL ?? '';

type Phase = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking' | 'error';

export type VoiceAgentFabProps = {
  accent: string;
  text: string;
  textMuted: string;
  onAccent: string;
};


export function VoiceAgentFab({ accent, text, textMuted, onAccent }: VoiceAgentFabProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = React.useState(false);

  // Push-to-talk state (fallback when no agent_id)
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [transcript, setTranscript] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [orbScale, setOrbScale] = React.useState(1);
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const useConvAI = Boolean(AGENT_ID && CONVAI_EMBED_URL);

  // ── Orb animation (push-to-talk mode only) ───────────────────────────
  const stopOrbLoop = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startOrbLoop = React.useCallback(() => {
    stopOrbLoop();
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      const breath = 1 + 0.05 * Math.sin(now / 400);
      setOrbScale((prev) => prev + (breath - prev) * Math.min(1, dt * 8));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopOrbLoop]);

  React.useEffect(() => {
    if (open && !useConvAI) startOrbLoop();
    else stopOrbLoop();
    return stopOrbLoop;
  }, [open, useConvAI, startOrbLoop, stopOrbLoop]);

  // ── Push-to-talk helpers ──────────────────────────────────────────────
  const stopRecording = React.useCallback(async (): Promise<string | null> => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) return null;
    try {
      await rec.stopAndUnloadAsync();
      return rec.getURI() ?? null;
    } catch {
      return null;
    }
  }, []);

  const processVoice = React.useCallback(async (audioUri: string | null) => {
    setPhase('transcribing');
    let userText = '';

    if (audioUri && Platform.OS !== 'web') {
      try {
        const formData = new FormData();
        const ext = Platform.OS === 'ios' ? 'caf' : 'm4a';
        const mime = Platform.OS === 'ios' ? 'audio/x-caf' : 'audio/m4a';
        formData.append('file', { uri: audioUri, type: mime, name: `audio.${ext}` } as any);
        const sttRes = await fetch(`${BACKEND_URL}/voice/stt`, { method: 'POST', body: formData });
        const sttData = (await sttRes.json()) as Record<string, unknown>;
        userText = (sttData.text as string) ?? '';
      } catch {
        userText = '';
      }
    }

    setTranscript(userText || '(getting trip context)');
    setPhase('thinking');

    try {
      const toolRes = await fetch(`${BACKEND_URL}/convai/tool/get_trip_context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const toolData = (await toolRes.json()) as Record<string, unknown>;
      const responseText = (toolData.result as string) ?? 'No trip data available.';
      setResponse(responseText);
      setPhase('speaking');
      const ttsUrl = `${BACKEND_URL}/voice/tts-preview?text=${encodeURIComponent(responseText)}`;
      const { sound } = await Audio.Sound.createAsync({ uri: ttsUrl }, { shouldPlay: true });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setPhase('idle');
          void sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {
      setResponse('Could not reach assistant. Check backend connection.');
      setPhase('error');
    }
  }, []);

  const handleOrbPress = React.useCallback(async () => {
    if (phase === 'transcribing' || phase === 'thinking' || phase === 'speaking') return;
    if (phase === 'recording') {
      const uri = await stopRecording();
      await processVoice(uri);
      return;
    }
    setTranscript('');
    setResponse('');
    if (Platform.OS === 'web') {
      setPhase('recording');
      setTimeout(() => void processVoice(null), 1500);
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setTranscript('Microphone permission required');
        setPhase('error');
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
        web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
      });
      await rec.startAsync();
      recordingRef.current = rec;
      setPhase('recording');
    } catch {
      setTranscript('Could not start microphone');
      setPhase('error');
    }
  }, [phase, stopRecording, processVoice]);

  const handleClose = React.useCallback(async () => {
    await stopRecording();
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPhase('idle');
    setTranscript('');
    setResponse('');
    setOpen(false);
  }, [stopRecording]);

  const phaseHint: Record<Phase, string> = {
    idle: 'Tap the orb to speak',
    recording: 'Listening… tap again when done',
    transcribing: 'Transcribing…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
    error: 'Tap to try again',
  };
  const orbBorderColor =
    phase === 'recording' ? '#ff4444' : phase === 'speaking' ? '#00ff88' : accent;
  const isProcessing = phase === 'transcribing' || phase === 'thinking' || phase === 'speaking';

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.fab,
          { bottom: Math.max(insets.bottom, 12) + 8, right: screenPaddingX, backgroundColor: accent },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open voice assistant"
      >
        <Ionicons name="mic" size={26} color={onAccent} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent={!useConvAI}
        statusBarTranslucent
        onRequestClose={() => void handleClose()}
      >
        {useConvAI ? (
          // ── ElevenLabs ConvAI WebView mode ──
          <View style={styles.convaiRoot}>
            <View style={[styles.convaiBar, { paddingTop: insets.top + 8 }]}>
              <Text style={[styles.convaiTitle, { color: '#fff' }]}>Voice Assistant</Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={styles.convaiClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>
            </View>
            <WebView
              style={styles.webview}
              source={{
                uri: CONVAI_EMBED_URL,
                headers: { 'Bypass-Tunnel-Reminder': 'true' },
              }}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
              onPermissionRequest={(req) => {
                req.grant(req.resources);
              }}
            />
            <View style={[styles.convaiFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <Text style={[styles.convaiPowered, { color: 'rgba(255,255,255,0.35)' }]}>
                Powered by ElevenLabs · XLS-40 DID · XRPL
              </Text>
            </View>
          </View>
        ) : (
          // ── Push-to-talk fallback mode ──
          <LinearGradient colors={['#0b1538', '#0a0f1a', '#000000']} style={styles.modalRoot}>
            <Pressable
              style={[styles.closeBtn, { top: insets.top + 8, right: Math.max(insets.right, 16) }]}
              onPress={() => void handleClose()}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={28} color={text} />
            </Pressable>

            <View style={[styles.column, { maxHeight: height * 0.82 }]}>
              <Text style={[styles.title, { color: text }]}>Voice Assistant</Text>
              <Text style={[styles.hint, { color: textMuted }]}>{phaseHint[phase]}</Text>

              {transcript ? (
                <View style={[styles.bubble, { borderColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={[styles.bubbleLabel, { color: textMuted }]}>You</Text>
                  <Text style={[styles.bubbleText, { color: text }]}>{transcript}</Text>
                </View>
              ) : null}

              {response ? (
                <View style={[styles.bubble, { borderColor: 'rgba(0,255,136,0.3)', backgroundColor: 'rgba(0,255,136,0.06)' }]}>
                  <Text style={[styles.bubbleLabel, { color: '#00ff88' }]}>Nexus</Text>
                  <Text style={[styles.bubbleText, { color: text }]}>{response}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => void handleOrbPress()}
                disabled={isProcessing}
                style={[styles.orbHit, { width: width * 0.55, height: width * 0.55, maxWidth: 240, maxHeight: 240 }]}
                accessibilityRole="button"
                accessibilityLabel={phase === 'recording' ? 'Stop recording' : 'Start recording'}
              >
                <View style={[
                  styles.orb,
                  {
                    transform: [{ scale: phase === 'recording' ? orbScale + 0.12 : orbScale }],
                    borderColor: orbBorderColor,
                    shadowColor: orbBorderColor,
                    opacity: isProcessing ? 0.7 : 1,
                  },
                ]}>
                  <LinearGradient
                    colors={
                      phase === 'recording'
                        ? ['rgba(255,68,68,0.45)', 'rgba(200,0,0,0.3)', 'rgba(15,23,42,0.9)']
                        : phase === 'speaking'
                          ? ['rgba(0,255,136,0.35)', 'rgba(0,180,80,0.25)', 'rgba(15,23,42,0.9)']
                          : ['rgba(56,189,248,0.35)', 'rgba(0,93,255,0.25)', 'rgba(15,23,42,0.9)']
                    }
                    style={styles.orbGradient}
                  />
                  <View style={styles.orbIconWrap}>
                    <Ionicons
                      name={phase === 'recording' ? 'stop-circle' : isProcessing ? 'ellipsis-horizontal' : 'mic'}
                      size={36}
                      color="#ffffff"
                    />
                  </View>
                </View>
              </Pressable>

              <Text style={[styles.poweredBy, { color: textMuted }]}>
                Powered by ElevenLabs · XLS-40 DID Auth
              </Text>
            </View>
          </LinearGradient>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    zIndex: 50,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  // ConvAI WebView mode
  convaiRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  convaiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#000',
  },
  convaiTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  convaiClose: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  convaiFooter: {
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: '#000',
  },
  convaiPowered: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  // Push-to-talk mode
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  closeBtn: {
    position: 'absolute',
    zIndex: 10,
    padding: 10,
  },
  column: {
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bubble: {
    width: '100%',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: 12,
    gap: 4,
  },
  bubbleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  orbHit: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  orb: {
    width: '70%',
    height: '70%',
    borderRadius: 9999,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOpacity: 0.6,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
  },
  orbIconWrap: {
    position: 'absolute',
  },
  poweredBy: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 4,
  },
});
