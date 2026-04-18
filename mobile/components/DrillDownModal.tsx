import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, spacing, useAppTheme } from '../utils/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

/** Full-screen dim + centered panel with a subtle zoom-in — avoids endless vertical lists for detail views. */
export function DrillDownModal({ visible, onClose, title, subtitle, children }: Props) {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxW = Math.min(width - spacing.md * 2, 400);
  const scale = useRef(new Animated.Value(0.94)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.94);
      opacity.setValue(0);
    }
  }, [visible, opacity, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Animated.View
          style={[
            styles.panelWrap,
            {
              maxWidth: maxW,
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.md,
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityViewIsModal
          >
            <View style={styles.panelHeader}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
              ) : null}
            </View>
            <ScrollView style={styles.panelBody} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            <Pressable
              onPress={onClose}
              style={[styles.closeBtn, { borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={[styles.closeText, { color: colors.text }]}>Close</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  panelWrap: {
    width: '100%',
  },
  panel: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  panelHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  panelBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    maxHeight: 360,
  },
  closeBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  closeText: { fontSize: 16, fontWeight: '600' },
});
