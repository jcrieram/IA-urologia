import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import ImportScreen from '../features/import/ImportScreen';
import ReportsScreen from '../features/reports/ReportsScreen';
import DebtsScreen from '../features/debts/DebtsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

function icon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
      }}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} options={{ tabBarIcon: icon('🏠') }} />
      <Tab.Screen name="Informes" component={ReportsScreen} options={{ tabBarIcon: icon('📊') }} />
      <Tab.Screen name="Deudas" component={DebtsScreen} options={{ tabBarIcon: icon('💳') }} />
      <Tab.Screen name="Importar" component={ImportScreen} options={{ tabBarIcon: icon('⬆️') }} />
    </Tab.Navigator>
  );
}
