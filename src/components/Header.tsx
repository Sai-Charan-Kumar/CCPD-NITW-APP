import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, GraduationCap } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { AuthUser, StudentProfile } from '../types';

interface HeaderProps {
  student: StudentProfile;
  unreadCount?: number;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  currentUser?: AuthUser | null;
  onPressManageDrives?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  unreadCount = 2,
  onPressNotifications,
  onPressProfile,
  currentUser,
  onPressManageDrives,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={onPressProfile}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{student.name}</Text>
            {currentUser?.role === 'TNP' && (
              <View style={styles.tnpPill}><Text style={styles.tnpPillText}>TnP</Text></View>
            )}
          </View>
          <Text style={styles.roll} numberOfLines={1}>
            {student.rollNumber} • {student.department.split('&')[0].trim()}
          </Text>
        </View>
      </TouchableOpacity>
      {currentUser?.role === 'TNP' && (
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={onPressManageDrives}
          accessibilityLabel="Manage Drives"
          activeOpacity={0.7}
        >
          <GraduationCap size={19} color={COLORS.primaryAccent} />
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={onPressNotifications}
          activeOpacity={0.7}
        >
          <Bell size={20} color={COLORS.primary} />
          {unreadCount > 0 && (
            <View style={styles.badgeDot}>
              <Text style={styles.badgeCount}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  infoSection: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tnpPill: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tnpPillText: { color: COLORS.textInverse, fontSize: 9, fontWeight: '800' },
  roll: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  manageBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  badgeCount: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
});
