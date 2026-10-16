import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { HeadTabParamList } from '../types';
import { CcpdHeadDashboardScreen } from '../screens/head/CcpdHeadDashboardScreen';
import { DrivesScreen } from '../screens/DrivesScreen';
import { PlacementStatsScreen } from '../screens/PlacementStatsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<HeadTabParamList>();

export const HeadTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HeadDashboard"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTitleStyle: {
          ...TYPOGRAPHY.h3,
          color: COLORS.primary,
        },
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HeadDashboard"
        component={CcpdHeadDashboardScreen}
        options={{
          title: 'Executive Directorate',
          tabBarLabel: 'Executive',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Drives"
        component={DrivesScreen}
        options={{
          title: 'Campus Drives Portfolio',
          tabBarLabel: 'Drives',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="PlacementStats"
        component={PlacementStatsScreen}
        options={{
          title: 'Institutional Analytics',
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'CCPD Directorate Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
