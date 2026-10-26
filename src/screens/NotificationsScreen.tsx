import React, { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { EmptyState } from '../components/EmptyState';
import { NotificationItem, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import { placementService } from '../data/placementService';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setNotifications(await placementService.getNotifications());
    } catch (error) {
      console.error('Failed to load notifications', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadNotifications(); }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      await placementService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update notifications.');
    }
  };

  const handleNotificationPress = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await placementService.markNotificationRead(notif.id);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to update notification.');
        return;
      }
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.driveId) navigation.navigate('JobDetail', { driveId: notif.driveId });
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
          loading ? null : errorMessage ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Could not load notifications</Text>
              <Text style={styles.stateBody}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void loadNotifications()}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <EmptyState
            icon={<Bell size={32} color={COLORS.textMuted} />}
            title="No Notifications"
            description="You are caught up with all campus placement alerts."
          />
          )
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
  stateCard: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  stateTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, textAlign: 'center' },
  stateBody: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs },
  retryButton: { marginTop: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  retryText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textInverse },
});
