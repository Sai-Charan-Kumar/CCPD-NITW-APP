import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Briefcase,
  FileCheck2,
  Award,
  TrendingUp,
  BookOpen,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../constants/theme';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { DriveCard } from '../components/DriveCard';
import { NoticeCard } from '../components/NoticeCard';
import { placementService } from '../data/placementService';
import { StudentProfile, PlacementDrive, Notice, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [appliedDriveIds, setAppliedDriveIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const studentData = await placementService.getStudentProfile();
      const allDrives = await placementService.getDrives();
      const allNotices = await placementService.getNotices();
      const applications = await placementService.getApplications();
      const unread = await placementService.getUnreadNoticesCount();

      setStudent(studentData);
      setDrives(allDrives);
      setNotices(allNotices.slice(0, 2)); // Show top 2 notices on dashboard
      setAppliedDriveIds(new Set(applications.map((a) => a.driveId)));
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, []);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(loadTimer);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading CCPD Portal...</Text>
      </View>
    );
  }

  // Filter urgent / upcoming drives
  const closingSoonDrives = drives.filter(
    (d) => d.status === 'deadline_near' || d.status === 'ongoing'
  ).slice(0, 3);

  return (
    <View style={styles.screen}>
      <Header
        student={student}
        currentUser={currentUser}
        unreadCount={unreadCount}
        onPressNotifications={() => navigation.navigate('Notifications')}
        onPressManageDrives={() => navigation.navigate('TnpDriveManagement')}
        onPressProfile={() => {
          // Tab navigation handles profile
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Quick Metrics */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Active Drives"
            value={drives.length}
            subtitle="Campus 2026"
            icon={<Briefcase size={20} color={COLORS.primaryAccent} />}
            accentColor={COLORS.primaryAccent}
          />
          <StatCard
            label="Applied"
            value={appliedDriveIds.size}
            subtitle="Active In-Pipeline"
            icon={<FileCheck2 size={20} color={COLORS.teal} />}
            accentColor={COLORS.teal}
          />
        </View>
        <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
          <StatCard
            label="Shortlists"
            value="2"
            subtitle="Microsoft & Google"
            icon={<Award size={20} color={COLORS.purple} />}
            accentColor={COLORS.purple}
          />
          <StatCard
            label="Highest Package"
            value="54.5 L"
            subtitle="Batch 2026 Record"
            icon={<TrendingUp size={20} color={COLORS.success} />}
            accentColor={COLORS.success}
            onPress={() => navigation.navigate('PlacementStats')}
          />
        </View>

        {/* Quick Shortcut Buttons Row */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('PlacementStats')}
            activeOpacity={0.7}
          >
            <TrendingUp size={16} color={COLORS.primaryAccent} />
            <Text style={styles.shortcutText}>Batch Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('InterviewExperiences')}
            activeOpacity={0.7}
          >
            <BookOpen size={16} color={COLORS.teal} />
            <Text style={styles.shortcutText}>Interview Archives</Text>
          </TouchableOpacity>
        </View>

        {/* Urgent Deadlines / Featured Drives */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Active Recruitment Drives</Text>
            <Text style={styles.sectionSubtitle}>Drives matching your department & CGPA</Text>
          </View>
        </View>

        {closingSoonDrives.map((drive) => {
          const { isEligible } = placementService.checkEligibility(student, drive);
          const isApplied = appliedDriveIds.has(drive.id);
          return (
            <DriveCard
              key={drive.id}
              drive={drive}
              isEligible={isEligible}
              isApplied={isApplied}
              onPress={() => navigation.navigate('JobDetail', { driveId: drive.id })}
            />
          );
        })}

        {/* Official Notices Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Official CCPD Notices</Text>
            <Text style={styles.sectionSubtitle}>Urgent shortlists and PPT schedule releases</Text>
          </View>
        </View>

        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            onPress={() => navigation.navigate('NoticeDetail', { noticeId: notice.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_RESERVED_HEIGHT,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  shortcutText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
