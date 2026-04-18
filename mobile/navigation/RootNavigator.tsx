import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getThemeColors } from '../utils/theme';
import type { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { ItineraryScreen } from '../screens/ItineraryScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HelpInsuranceScreen } from '../screens/HelpInsuranceScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { FixSituationScreen } from '../screens/FixSituationScreen';
import { PaymentApprovalScreen } from '../screens/PaymentApprovalScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const c = getThemeColors();

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: c.accent,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.border,
      notification: c.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Itinerary" component={ItineraryScreen} options={{ title: 'Itinerary' }} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Details' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Updates' }} />
        <Stack.Screen
          name="HelpInsurance"
          component={HelpInsuranceScreen}
          options={{ title: 'Help & coverage' }}
        />
        <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
        <Stack.Screen
          name="FixSituation"
          component={FixSituationScreen}
          options={{ title: 'Fix my situation', presentation: 'modal' }}
        />
        <Stack.Screen
          name="PaymentApproval"
          component={PaymentApprovalScreen}
          options={{ title: 'Review', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
