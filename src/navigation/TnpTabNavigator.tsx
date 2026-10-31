import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Briefcase, User } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { TnpDriveManagementScreen } from '../screens/tnp/TnpDriveManagementScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';

type TnpTabParamList = {
  DriveManagement: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TnpTabParamList>();

export const TnpTabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="DriveManagement"
    tabBar={(props) => <FloatingTabBar {...props} />}
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: COLORS.primaryAccent,
      tabBarInactiveTintColor: COLORS.textMuted,
      headerStyle: {
        backgroundColor: COLORS.surface,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      },
      headerTitleStyle: { ...TYPOGRAPHY.h3, color: COLORS.primary },
      tabBarStyle: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        height: 128,
      },
    }}
  >
    <Tab.Screen
      name="DriveManagement"
      component={TnpDriveManagementScreen}
      options={{
        title: 'Manage Drives',
        tabBarLabel: 'Drives',
        tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'T&P Officer Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);
