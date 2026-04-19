import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { LiquidGlassPressable } from '../components/LiquidGlassPressable';
import { screenPaddingX, spacing, useAppTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const colors = useAppTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), password);
      navigation.replace('MainHome');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: 'transparent' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.kicker, { color: colors.textMuted }]}>New account</Text>
        <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          We only store email and a password hash for app login. Verifiable identity stays on-chain.
        </Text>

        {error ? (
          <Text style={[styles.err, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@company.com"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
        />

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title="Create account" onPress={() => void submit()} loading={busy} />
        </View>

        <LiquidGlassPressable
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          minHeight={46}
          pressableStyle={styles.linkWrap}
          innerStyle={styles.linkInner}
        >
          <Text style={[styles.link, { color: colors.text }]}>Already have an account? Sign in</Text>
        </LiquidGlassPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  kicker: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  sub: { fontSize: 15, lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, marginTop: spacing.md },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  err: { fontSize: 14, marginBottom: spacing.sm, fontWeight: '600' },
  linkWrap: { alignSelf: 'center', marginTop: spacing.lg },
  linkInner: { paddingVertical: 10, paddingHorizontal: spacing.md },
  link: { fontSize: 16, fontWeight: '600' },
});
