import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { GlobalCosmicBackdrop } from '../components/GlobalCosmicBackdrop';
import { useCosmicBackdrop } from '../context/CosmicBackdropContext';
import { getThemeColors } from '../utils/theme';
import type { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';
import { HomeScreen } from '../screens/HomeScreen';
import { PlanNewTripScreen } from '../screens/PlanNewTripScreen';
import { CurrentTripScreen } from '../screens/CurrentTripScreen';
import { BadgesScreen } from '../screens/BadgesScreen';
import { BookingHubScreen } from '../screens/BookingHubScreen';
import { BudgetPlanningScreen } from '../screens/BudgetPlanningScreen';
import { BudgetCurrentTripScreen } from '../screens/BudgetCurrentTripScreen';
import { CompanyPolicyPlanScreen } from '../screens/CompanyPolicyPlanScreen';
import { PackingListScreen } from '../screens/PackingListScreen';
import { CurrentBookingsScreen } from '../screens/CurrentBookingsScreen';
import { CurrentMeetingsScreen } from '../screens/CurrentMeetingsScreen';
import { FoodDiscoverScreen } from '../screens/FoodDiscoverScreen';
import { TravelRoutingScreen } from '../screens/TravelRoutingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { ItineraryScreen } from '../screens/ItineraryScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HelpInsuranceScreen } from '../screens/HelpInsuranceScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { FixSituationScreen } from '../screens/FixSituationScreen';
import { PaymentApprovalScreen } from '../screens/PaymentApprovalScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { PastTripSummaryScreen } from '../screens/PastTripSummaryScreen';
import { GlobeMapScreen } from '../screens/GlobeMapScreen';
import { GlobeMapTapOverlay } from '../components/GlobeMapTapOverlay';
import { VoiceAgentFab } from '../components/ui/voice-agent-fab';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const c = getThemeColors();
  const { isReady } = useAuth();
  const { setEarthBackdropMode } = useCosmicBackdrop();
  const [navRoute, setNavRoute] = useState<string | undefined>(undefined);
  const [navigationReady, setNavigationReady] = useState(false);

  const syncEarthBackdropMode = useCallback(() => {
    if (!navigationRef.isReady()) return;
    const name = navigationRef.getCurrentRoute()?.name;
    setEarthBackdropMode(name === 'Welcome' ? 'gradient' : 'globe');
  }, [setEarthBackdropMode]);

  const syncNavRoute = useCallback(() => {
    if (!navigationRef.isReady()) return;
    setNavRoute(navigationRef.getCurrentRoute()?.name);
  }, []);

  const onNavigationReady = useCallback(() => {
    setNavigationReady(true);
    syncEarthBackdropMode();
    syncNavRoute();
  }, [syncEarthBackdropMode, syncNavRoute]);

  const onNavigationStateChange = useCallback(() => {
    syncEarthBackdropMode();
    syncNavRoute();
  }, [syncEarthBackdropMode, syncNavRoute]);

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: c.accent,
      background: 'transparent',
      card: 'rgba(12, 12, 18, 0.88)',
      text: c.text,
      border: c.border,
      notification: c.accent,
    },
  };

  if (!isReady) {
    return (
      <View style={styles.bootWrap}>
        <GlobalCosmicBackdrop />
        <View style={styles.bootInner}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <GlobalCosmicBackdrop />
      <View style={styles.navLayer}>
        <NavigationContainer
          ref={navigationRef}
          theme={navTheme}
          onReady={onNavigationReady}
          onStateChange={onNavigationStateChange}
        >
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'rgba(12, 12, 18, 0.88)' },
              headerTintColor: c.text,
              headerTitleStyle: { fontWeight: '600', fontSize: 17 },
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Nexus · Sign in' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Nexus · Create account' }} />
            <Stack.Screen name="MainHome" component={HomeScreen} options={{ headerShown: false, title: 'Nexus' }} />
            <Stack.Screen
              name="PastTripSummary"
              component={PastTripSummaryScreen}
              options={{ title: 'Nexus · Trip' }}
            />
            <Stack.Screen name="PlanNewTrip" component={PlanNewTripScreen} options={{ title: 'Nexus · Plan' }} />
            <Stack.Screen name="CurrentTrip" component={CurrentTripScreen} options={{ title: 'Nexus · Trip' }} />
            <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Nexus · Badges' }} />
            <Stack.Screen name="BookingHub" component={BookingHubScreen} options={{ title: 'Nexus · Booking' }} />
            <Stack.Screen name="BudgetPlanning" component={BudgetPlanningScreen} options={{ title: 'Nexus · Budget' }} />
            <Stack.Screen name="BudgetCurrentTrip" component={BudgetCurrentTripScreen} options={{ title: 'Nexus · Budget' }} />
            <Stack.Screen name="CompanyPolicyPlan" component={CompanyPolicyPlanScreen} options={{ title: 'Nexus · Policy' }} />
            <Stack.Screen name="PackingList" component={PackingListScreen} options={{ title: 'Nexus · Pack' }} />
            <Stack.Screen name="CurrentBookings" component={CurrentBookingsScreen} options={{ title: 'Nexus · Bookings' }} />
            <Stack.Screen name="CurrentMeetings" component={CurrentMeetingsScreen} options={{ title: 'Nexus · Meetings' }} />
            <Stack.Screen name="FoodDiscover" component={FoodDiscoverScreen} options={{ title: 'Nexus · Food' }} />
            <Stack.Screen name="TravelRouting" component={TravelRoutingScreen} options={{ title: 'Nexus · Maps' }} />
            <Stack.Screen name="GlobeMap" component={GlobeMapScreen} options={{ headerShown: false, title: 'Map' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Nexus · You' }} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Nexus · Treasury' }} />
            <Stack.Screen name="Itinerary" component={ItineraryScreen} options={{ title: 'Nexus · Itinerary' }} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Nexus · Details' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Nexus · Updates' }} />
            <Stack.Screen
              name="HelpInsurance"
              component={HelpInsuranceScreen}
              options={{ title: 'Nexus · Help' }}
            />
            <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Nexus · Expenses' }} />
            <Stack.Screen
              name="FixSituation"
              component={FixSituationScreen}
              options={{ title: 'Nexus · Assist', presentation: 'modal' }}
            />
            <Stack.Screen
              name="PaymentApproval"
              component={PaymentApprovalScreen}
              options={{ title: 'Nexus · Review', presentation: 'modal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <GlobeMapTapOverlay currentRouteName={navRoute} navigationReady={navigationReady} />
        {navRoute === 'MainHome' ? (
          <VoiceAgentFab
            accent={c.accent}
            text={c.text}
            textMuted={c.textMuted}
            onAccent={c.onAccent}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  navLayer: {
    flex: 1,
    zIndex: 1,
    position: 'relative',
  },
  bootWrap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  bootInner: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
