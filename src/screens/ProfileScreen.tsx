import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Info,
  LogOut,
  Mail,
  Phone,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../constants/theme';
import { placementService } from '../data/placementService';
import { Department, StudentInterviewRecord, StudentProfile, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, logout } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviewHistory, setInterviewHistory] = useState<StudentInterviewRecord[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        if (
          currentUser &&
          (currentUser.role === 'STUDENT' || currentUser.role === 'TNP') &&
          currentUser.rollNumber &&
          currentUser.department &&
          currentUser.cgpa !== undefined
        ) {
          placementService.updateStudentIdentity({
            name: currentUser.name,
            rollNumber: currentUser.rollNumber,
            email: currentUser.email,
            department: currentUser.department as Department,
            cgpa: currentUser.cgpa,
          });
        }
        const data = await placementService.getStudentProfile();
        setStudent(data);
        const history = await placementService.getStudentInterviewHistory(data.id);
        setInterviewHistory(history);
      } catch (err) {
        console.error('Failed to load student profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [currentUser]);

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of CCPD Placement Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (loading || !student) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isStudent = !currentUser || currentUser.role !== 'CCPD_HEAD';
  const displayName = currentUser?.name || student.name;
  const displayEmail = currentUser?.email || student.email;
  const displayRole = currentUser?.role || 'STUDENT';

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* User Identity Card */}
      <View style={[styles.profileCard, SHADOWS.card]}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName} numberOfLines={1}>
                {displayName}
              </Text>
              <StatusBadge type="role" value={displayRole} size="small" />
            </View>
            {isStudent ? (
              <>
                <Text style={styles.rollNumber}>
                  {currentUser?.rollNumber || student.rollNumber} • {student.registrationNumber}
                </Text>
                <Text style={styles.departmentText}>
                  {student.degree} in {currentUser?.department || student.department}
                </Text>
                <Text style={styles.batchText}>Graduating Batch: {student.batch}</Text>
              </>
            ) : (
              <>
                <Text style={styles.rollNumber}>{currentUser?.designation}</Text>
                <Text style={styles.departmentText}>{currentUser?.department}</Text>
              </>
            )}
          </View>
        </View>

        {!isStudent && (
          <View style={styles.verifiedRow}>
            <ShieldCheck size={16} color={COLORS.successDark} />
            <Text style={styles.verifiedLabel}>Authorized CCPD Placement Officer Account</Text>
          </View>
        )}
      </View>

      {/* Student Academic & Resume Sections (Only shown for Students) */}
      {isStudent && (
        <>
          {/* Academic Records Breakdown */}
          <View style={[styles.sectionCard, SHADOWS.card]}>
            <Text style={styles.sectionTitle}>Academic Records</Text>

            <View style={styles.academicGrid}>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>Current CGPA</Text>
                <Text style={styles.academicValue}>
                  {(currentUser?.cgpa || student.cgpa).toFixed(2)}
                </Text>
                <Text style={styles.academicSub}>Scale of 10.0</Text>
              </View>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>Active Backlogs</Text>
                <Text style={[styles.academicValue, { color: COLORS.successDark }]}>
                  {student.activeBacklogs}
                </Text>
                <Text style={styles.academicSub}>All Cleared</Text>
              </View>
            </View>

            <View style={[styles.academicGrid, { marginTop: SPACING.sm }]}>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>10th Percentage</Text>
                <Text style={styles.academicValueSmall}>{student.tenthPercentage}%</Text>
                <Text style={styles.academicSub}>CBSE Board</Text>
              </View>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>12th / Inter Percentage</Text>
                <Text style={styles.academicValueSmall}>{student.twelfthPercentage}%</Text>
                <Text style={styles.academicSub}>State Board</Text>
              </View>
            </View>
          </View>

          {/* CCPD Master Resume Card */}
          <View style={[styles.sectionCard, SHADOWS.card]}>
            <Text style={styles.sectionTitle}>Master Placement Resume</Text>
            <Text style={styles.sectionSubtitle}>
              This verified resume is automatically forwarded when applying to campus drives.
            </Text>

            <View style={styles.resumeItem}>
              <View style={styles.resumeIconBox}>
                <FileText size={22} color={COLORS.primaryAccent} />
              </View>
              <View style={styles.resumeMeta}>
                <Text style={styles.resumeFileName} numberOfLines={1}>
                  {student.resume.fileName}
                </Text>
                <Text style={styles.resumeDate}>
                  Verified on {student.resume.updatedAt} • PDF Format
                </Text>
              </View>
              <TouchableOpacity
                style={styles.previewBtn}
                onPress={() =>
                  Alert.alert('Resume Preview', `Opening ${student.resume.fileName} in viewer...`)
                }
              >
                <ExternalLink size={16} color={COLORS.primaryAccent} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.updateResumeBtn}
              onPress={() =>
                Alert.alert(
                  'Resume Revision Request',
                  'To update your verified resume, submit your updated PDF along with credential proof to the CCPD office.'
                )
              }
            >
              <Text style={styles.updateResumeBtnText}>Request Resume Update</Text>
            </TouchableOpacity>
          </View>

          {/* Technical Skills */}
          <View style={[styles.sectionCard, SHADOWS.card]}>
            <Text style={styles.sectionTitle}>Profile Technical Skills</Text>
            <View style={styles.skillsContainer}>
              {student.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionCard, SHADOWS.card]}>
        <View style={styles.interviewSectionHeader}>
              <View style={styles.interviewSectionTitle}>
                <Text style={styles.sectionTitle}>My Interviews</Text>
                <Text style={styles.sectionSubtitle}>
                  Record interviews you attended and keep your experience history.
                </Text>
              </View>
            </View>

            {interviewHistory.length === 0 ? (
              <Text style={styles.emptyInterviewText}>
                No interviews recorded yet. Add one after you interview with a company.
              </Text>
            ) : (
              interviewHistory.map((record) => (
                <View key={record.id} style={styles.interviewRecord}>
                  <View style={styles.interviewRecordHeader}>
                    <View style={styles.interviewRecordTitle}>
                      <Text style={styles.interviewCompany}>{record.companyName}</Text>
                      <Text style={styles.interviewRole}>{record.role}</Text>
                    </View>
                    <Text style={styles.interviewOutcome}>{record.outcome}</Text>
                  </View>
                  <Text style={styles.interviewDate}>{record.interviewDate}</Text>
                  <Text style={styles.interviewNotes}>{record.notes}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {/* Contact & Credentials Details */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Mail size={16} color={COLORS.textMuted} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{displayEmail}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color={COLORS.textMuted} />
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{currentUser?.phone || student.phone}</Text>
        </View>
      </View>

      {/* Quick Navigation Items */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <Text style={styles.sectionTitle}>Placement Resources</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PlacementStats')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.primarySoft }]}>
              <TrendingUp size={18} color={COLORS.primaryAccent} />
            </View>
            <View>
              <Text style={styles.menuTitle}>Campus Placement Statistics</Text>
              <Text style={styles.menuSubtitle}>Average packages, top recruiters, branch reports</Text>
            </View>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('InterviewExperiences')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.tealLight }]}>
              <BookOpen size={18} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.menuTitle}>Senior Interview Archives</Text>
              <Text style={styles.menuSubtitle}>Real questions asked at Microsoft, TI, Google</Text>
            </View>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Institute Placement Policy Summary */}
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <Info size={16} color={COLORS.primaryAccent} />
          <Text style={styles.policyTitle}>CCPD Code of Conduct</Text>
        </View>
        <Text style={styles.policyBody}>
          100% attendance is mandatory for shortlists. Unexcused absence from online assessments or interview rounds results in disciplinary action under placement regulations.
        </Text>
      </View>

      {/* Prominent Log Out Button */}
      <TouchableOpacity
        style={[styles.logoutBtn, SHADOWS.card]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <LogOut size={18} color={COLORS.danger} />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_RESERVED_HEIGHT,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  studentName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  rollNumber: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  departmentText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  batchText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  verifiedLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.successDark,
    fontWeight: '600',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  academicGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  academicBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  academicLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  academicValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryAccent,
  },
  academicValueSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  academicSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  resumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  resumeIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeMeta: {
    flex: 1,
  },
  resumeFileName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  resumeDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  previewBtn: {
    padding: 6,
  },
  updateResumeBtn: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  updateResumeBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.sm,
  },
  skillChip: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
    gap: 8,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    width: 60,
  },
  infoValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  menuSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  policyCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.lg,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  policyTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
  },
  policyBody: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  interviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  interviewSectionTitle: {
    flex: 1,
    marginRight: SPACING.md,
  },
  emptyInterviewText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  interviewRecord: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingVertical: SPACING.md,
  },
  interviewRecordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interviewRecordTitle: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  interviewCompany: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  interviewRole: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  interviewOutcome: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  interviewDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  interviewNotes: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.dangerBorder,
    marginBottom: SPACING.xl,
    gap: 8,
  },
  logoutBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.danger,
    fontSize: 14,
  },
});
