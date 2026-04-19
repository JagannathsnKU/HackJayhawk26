import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnomalousMatterHero } from '../components/ui/anomalous-matter-hero';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAuth } from '../context/AuthContext';
import { getThemeColors } from '../utils/theme';
import type { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const colors = getThemeColors();
  const { user, token } = useAuth();
  const isLoggedIn = Boolean(user && token);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'right', 'left', 'bottom']}
    >
      <View style={styles.column}>
        <View style={[styles.heroSlot]}>
          <AnomalousMatterHero
            subtitle="Intelligent Travel Companion"
            description="Trip guardrails, policy, and smart travel tools in one place."
            meshRadius={0.68}
            cameraZ={5.1}
            fov={48}
          />
        </View>
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <View style={styles.buttonWrap}>
            {isLoggedIn ? (
              <PrimaryButton title="Continue to app" onPress={() => navigation.replace('MainTabs')} />
            ) : (
              <>
                <PrimaryButton title="Sign in" onPress={() => navigation.navigate('Login')} />
                <View style={styles.secondaryWrap}>
                  <SecondaryButton title="Create account" onPress={() => navigation.navigate('Register')} />
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  heroSlot: {
    flex: 1,
    minHeight: 0,
    width: '100%'
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  buttonWrap: {
    width: '100%',
  },
  secondaryWrap: {
    width: '100%',
    marginTop: 12,
  },
});
