import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Briefcase,
  Award,
  Calendar,
  CheckCircle2,
  Trash2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'drive' | 'shortlist' | 'interview' | 'general';
  isRead: boolean;
  targetScreen?: keyof RootStackParamList;
  targetParams?: any;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-1',
    title: 'Microsoft Round 2 Shortlist Published',
    body: 'You have been shortlisted for Technical Round 2 (Design & Core). Check your assigned slot.',
    time: '2 hours ago',
    type: 'shortlist',
    isRead: false,
    targetScreen: 'NoticeDetail',
    targetParams: { noticeId: 'NOT-2026-042' },
  },
  {
    id: 'NOTIF-2',
    title: 'Google SDE Online Assessment Live in 48h',
    body: 'Assessment invitations have been sent to your student email. Complete system checks.',
    time: '5 hours ago',
    type: 'drive',
    isRead: false,
    targetScreen: 'JobDetail',
    targetParams: { driveId: 'DRV-2026-001' },
  },
  {
    id: 'NOTIF-3',
    title: 'Texas Instruments Pre-Placement Talk',
    body: 'Mandatory PPT tomorrow at 04:30 PM in Dr. B.R. Ambedkar Central Auditorium.',
    time: 'Yesterday',
    type: 'interview',
    isRead: true,
    targetScreen: 'NoticeDetail',
    targetParams: { noticeId: 'NOT-2026-041' },
  },
  {
    id: 'NOTIF-4',
    title: 'CCPD Placement Gazette 2026 Ratified',
    body: 'Review the updated policies on Dream and Super Dream upgrades and rules.',
    time: '3 days ago',
    type: 'general',
    isRead: true,
    targetScreen: 'NoticeDetail',
    targetParams: { noticeId: 'NOT-2026-039' },
  },
];

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );

    if (notif.targetScreen) {
      navigation.navigate(notif.targetScreen as any, notif.targetParams);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'shortlist':
        return <Award size={18} color={COLORS.purple} />;
      case 'drive':
        return <Briefcase size={18} color={COLORS.primaryAccent} />;
      case 'interview':
        return <Calendar size={18} color={COLORS.warningDark} />;
      default:
        return <Bell size={18} color={COLORS.teal} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <Text style={styles.counterText}>
          {notifications.filter((n) => !n.isRead).length} unread updates
        </Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={markAllRead}>
          <CheckCircle2 size={14} color={COLORS.primaryAccent} />
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notifCard,
              SHADOWS.card,
              !item.isRead && styles.unreadCard,
            ]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>{getIcon(item.type)}</View>
            <View style={styles.contentColumn}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={32} color={COLORS.textMuted} />}
            title="No Notifications"
            description="You are caught up with all campus placement alerts."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  counterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markReadText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: '#FAF5FF',
    borderColor: COLORS.purpleBorder,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 13,
  },
  unreadTitle: {
    color: '#1E1B4B',
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryAccent,
    marginLeft: 6,
  },
  body: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  time: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
