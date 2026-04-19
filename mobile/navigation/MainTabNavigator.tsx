import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabBar, createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors } from '../utils/theme';
import { useCosmicBackdrop } from '../context/CosmicBackdropContext';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabParallaxBar(props: BottomTabBarProps) {
  const { setTabIndex } = useCosmicBackdrop();

  useEffect(() => {
    setTabIndex(props.state.index);
  }, [props.state.index, setTabIndex]);

  return <BottomTabBar {...props} />;
}

export function MainTabNavigator() {
  const c = getThemeColors();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <TabParallaxBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(8, 10, 20, 0.82)',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
