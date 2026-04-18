import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { getThemeColors } from '../utils/theme';
import type { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { ItineraryScreen } from '../screens/ItineraryScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HelpInsuranceScreen } from '../screens/HelpInsuranceScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { FixSituationScreen } from '../screens/FixSituationScreen';
import { PaymentApprovalScreen } from '../screens/PaymentApprovalScreen';
import { TravelPolicyScreen } from '../screens/TravelPolicyScreen';
import { DisruptionGuideScreen } from '../screens/DisruptionGuideScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const scheme = useColorScheme();
  const c = getThemeColors(scheme);

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
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
        initialRouteName="Home"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Itinerary" component={ItineraryScreen} options={{ title: 'Itinerary' }} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Details' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Updates' }} />
        <Stack.Screen
          name="HelpInsurance"
          component={HelpInsuranceScreen}
          options={{ title: 'Help & coverage' }}
        />
        <Stack.Screen name="TravelPolicy" component={TravelPolicyScreen} options={{ title: 'Travel policy' }} />
        <Stack.Screen
          name="DisruptionGuide"
          component={DisruptionGuideScreen}
          options={{ title: 'During a disruption' }}
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
