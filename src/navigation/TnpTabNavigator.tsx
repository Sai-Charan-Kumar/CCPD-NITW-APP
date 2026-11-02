import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BriefcaseBusiness, MessageCircle, User } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { StudentBottomTabParamList } from '../types';
import { TnpDriveManagementScreen } from '../screens/tnp/TnpDriveManagementScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator<StudentBottomTabParamList>();

export const TnpTabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={(props) => <FloatingTabBar {...props} />}
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: COLORS.primaryAccent,
      tabBarInactiveTintColor: COLORS.textMuted,
      headerStyle: { backgroundColor: COLORS.surface, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
      headerTitleStyle: { ...TYPOGRAPHY.h3, color: COLORS.primary },
      tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, height: 128 },
    }}
  >
    <Tab.Screen name="Home" component={TnpDriveManagementScreen} options={{ headerShown: false, title: 'TNP Operations', tabBarLabel: 'Operations', tabBarIcon: ({ color, size }) => <BriefcaseBusiness size={size} color={color} /> }} />
    <Tab.Screen name="Groups" component={GroupsScreen} options={{ title: 'Placement Groups', tabBarLabel: 'Groups', tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile', tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
  </Tab.Navigator>
);
