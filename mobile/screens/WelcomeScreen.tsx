import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CosmicLandingBranding } from '../components/ui/CosmicLandingBranding';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAuth } from '../context/AuthContext';
import type { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { user, token } = useAuth();
  const isLoggedIn = Boolean(user && token);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.column}>
        <View style={styles.heroSlot}>
          <CosmicLandingBranding
            head="Nexus"
            text="Secured, Safe, Travel"
            logo={require('../assets/nexus-logo.png')}
          />
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.55)']}
          locations={[0, 0.45, 1]}
          style={[styles.footerGradient, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View style={styles.footerInner}>
            <View style={styles.buttonWrap}>
              {isLoggedIn ? (
                <PrimaryButton title="Continue to app" onPress={() => navigation.replace('MainHome')} />
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
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  heroSlot: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
  },
  footerGradient: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  footerInner: {
    width: '100%',
  },
  buttonWrap: {
    width: '100%',
  },
  secondaryWrap: {
    width: '100%',
    marginTop: 12,
  },
});
