import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { StudentBottomTabs } from './StudentBottomTabs';
import { HeadTabNavigator } from './HeadTabNavigator';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { ApplicationDetailScreen } from '../screens/ApplicationDetailScreen';
import { NoticeDetailScreen } from '../screens/NoticeDetailScreen';
import { PlacementStatsScreen } from '../screens/PlacementStatsScreen';
import { InterviewExperiencesScreen } from '../screens/InterviewExperiencesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RootStackParamList } from '../types';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { TnpDriveManagementScreen } from '../screens/tnp/TnpDriveManagementScreen';
import { TnpCreateDriveScreen } from '../screens/tnp/TnpCreateDriveScreen';
import { DriveAdminScreen } from '../screens/tnp/DriveAdminScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { currentUser } = useAuth();

  // If not logged in, render the Auth Stack
  if (!currentUser) {
    return <AuthNavigator />;
  }

  // Dynamic role-based main tab component
  const getRoleTabNavigator = () => {
    switch (currentUser.role) {
      case 'CCPD_HEAD':
        return HeadTabNavigator;
      case 'TNP':
      case 'STUDENT':
      default:
        return StudentBottomTabs;
    }
  };

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          ...TYPOGRAPHY.h3,
          color: COLORS.primary,
        },
        headerBackTitle: 'Back',
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={getRoleTabNavigator()}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="TnpDriveManagement" component={TnpDriveManagementScreen} options={{ title: 'Manage Drives' }} />
      <Stack.Screen name="CreateDrive" component={TnpCreateDriveScreen} options={{ title: 'Create New Drive' }} />
      <Stack.Screen name="DriveAdmin" component={DriveAdminScreen} options={{ title: 'Drive Administration' }} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} options={({ route }) => ({ title: `${route.params.companyName} Group` })} />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          title: 'Drive Details',
        }}
      />
      <Stack.Screen
        name="ApplicationDetail"
        component={ApplicationDetailScreen}
        options={{
          title: 'Application Journey',
        }}
      />
      <Stack.Screen
        name="NoticeDetail"
        component={NoticeDetailScreen}
        options={{
          title: 'Official Announcement',
        }}
      />
      <Stack.Screen
        name="PlacementStats"
        component={PlacementStatsScreen}
        options={{
          title: 'Institutional Analytics',
        }}
      />
      <Stack.Screen
        name="InterviewExperiences"
        component={InterviewExperiencesScreen}
        options={{
          title: 'Senior Interview Archives',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
};
