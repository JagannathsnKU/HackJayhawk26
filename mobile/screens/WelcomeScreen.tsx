import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnomalousMatterHero } from '../components/ui/anomalous-matter-hero';
import { PrimaryButton } from '../components/PrimaryButton';
import { getThemeColors } from '../utils/theme';
import type { RootStackScreenProps } from '../navigation/types';

type Props = RootStackScreenProps<'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const colors = getThemeColors();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'right', 'left', 'bottom']}
    >
      <View style={styles.column}>
        <View style={styles.heroSlot}>
          <AnomalousMatterHero
            title="HackJayhawk"
            subtitle="Intelligent Travel Companion"
            description="Trip guardrails and companion agents in one place."
          />
        </View>
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <View style={styles.buttonWrap}>
            <PrimaryButton title="Enter the app" onPress={() => navigation.replace('MainTabs')} />
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
    width: '100%',
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
});
