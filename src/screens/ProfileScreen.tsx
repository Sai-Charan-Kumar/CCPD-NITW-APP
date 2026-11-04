import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Info,
  LogOut,
  Mail,
  Phone,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../constants/theme';
import { placementService } from '../data/placementService';
import { Department, StudentProfile, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { getApiErrorMessage } from '../api/axiosClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  registrationNumber: string;
  department: string;
  degree: string;
  batch: string;
  cgpa: string;
  activeBacklogs: string;
  tenthPercentage: string;
  twelfthPercentage: string;
  skills: string;
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, tnpMode, logout, updateCurrentUser } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        if (currentUser?.role === 'CCPD_HEAD') {
          setStudent(null);
          return;
        }
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
      } catch (err) {
        console.error('Failed to load student profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [currentUser, tnpMode]);

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

  const openEditor = () => {
    if (!student) return;
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      rollNumber: student.rollNumber,
      registrationNumber: student.registrationNumber,
      department: student.department,
      degree: student.degree,
      batch: student.batch,
      cgpa: String(student.cgpa),
      activeBacklogs: String(student.activeBacklogs),
      tenthPercentage: String(student.tenthPercentage),
      twelfthPercentage: String(student.twelfthPercentage),
      skills: student.skills.join(', '),
    });
    setEditing(true);
  };

  const updateForm = (field: keyof ProfileForm, value: string) => {
    setForm((current) => current ? { ...current, [field]: value } : current);
  };

  const saveProfile = async () => {
    if (!form) return;
    const cgpa = Number(form.cgpa);
    const activeBacklogs = Number(form.activeBacklogs);
    const tenthPercentage = Number(form.tenthPercentage);
    const twelfthPercentage = Number(form.twelfthPercentage);
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Incomplete profile', 'Name and email are required.');
      return;
    }
    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
      Alert.alert('Invalid CGPA', 'CGPA must be between 0 and 10.');
      return;
    }
    if (![tenthPercentage, twelfthPercentage].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
      Alert.alert('Invalid percentage', '10th and 12th percentages must be between 0 and 100.');
      return;
    }
    if (!Number.isInteger(activeBacklogs) || activeBacklogs < 0) {
      Alert.alert('Invalid backlogs', 'Active backlogs must be a whole number greater than or equal to 0.');
      return;
    }

    setSaving(true);
    try {
      const updated = await placementService.updateStudentProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        rollNumber: form.rollNumber.trim(),
        registrationNumber: form.registrationNumber.trim(),
        department: form.department.trim() as Department,
        degree: form.degree.trim() ? form.degree.trim() as StudentProfile['degree'] : undefined,
        batch: form.batch.trim(),
        cgpa,
        activeBacklogs,
        tenthPercentage,
        twelfthPercentage,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      });
      setStudent(updated);
      updateCurrentUser({
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        rollNumber: updated.rollNumber,
        department: updated.department,
        cgpa: updated.cgpa,
      });
      setEditing(false);
      Alert.alert('Profile updated', 'Your profile changes have been saved.');
    } catch (error) {
      Alert.alert('Unable to update profile', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const isStudent = !currentUser || currentUser.role !== 'CCPD_HEAD';

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isStudent && !student) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const profile = student!;
  const displayName = isStudent ? profile.name : currentUser?.name || '';
  const displayEmail = isStudent ? profile.email : currentUser?.email || '';
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
          {isStudent && (
            <TouchableOpacity style={styles.editButton} onPress={openEditor} activeOpacity={0.8}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
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
                  {profile.rollNumber} • {profile.registrationNumber}
                </Text>
                <Text style={styles.departmentText}>
                  {profile.degree} in {profile.department}
                </Text>
                <Text style={styles.batchText}>Graduating Batch: {profile.batch}</Text>
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
                  {profile.cgpa.toFixed(2)}
                </Text>
                <Text style={styles.academicSub}>Scale of 10.0</Text>
              </View>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>Active Backlogs</Text>
                <Text style={[styles.academicValue, { color: COLORS.successDark }]}>
                  {profile.activeBacklogs}
                </Text>
                <Text style={styles.academicSub}>All Cleared</Text>
              </View>
            </View>

            <View style={[styles.academicGrid, { marginTop: SPACING.sm }]}>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>10th Percentage</Text>
                <Text style={styles.academicValueSmall}>{profile.tenthPercentage}%</Text>
                <Text style={styles.academicSub}>CBSE Board</Text>
              </View>
              <View style={styles.academicBox}>
                <Text style={styles.academicLabel}>12th / Inter Percentage</Text>
                <Text style={styles.academicValueSmall}>{profile.twelfthPercentage}%</Text>
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
                  {profile.resume.fileName}
                </Text>
                <Text style={styles.resumeDate}>
                  Verified on {profile.resume.updatedAt} • PDF Format
                </Text>
              </View>
              <TouchableOpacity
                style={styles.previewBtn}
                onPress={() =>
                  Alert.alert('Resume Preview', `Opening ${profile.resume.fileName} in viewer...`)
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
              {profile.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
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
          <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
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
      {form && (
        <Modal visible={editing} animationType="slide" onRequestClose={() => !saving && setEditing(false)}>
          <ScrollView style={styles.editorContainer} contentContainerStyle={styles.editorContent}>
            <Text style={styles.editorTitle}>Edit Profile</Text>
            <Text style={styles.editorSubtitle}>Update your personal and academic information.</Text>
            {([
              ['name', 'Full name'],
              ['email', 'Email address'],
              ['phone', 'Phone number'],
              ['rollNumber', 'Roll number'],
              ['registrationNumber', 'Registration number'],
              ['department', 'Department / branch'],
              ['degree', 'Degree (B.Tech, M.Tech, or MCA)'],
              ['batch', 'Graduation year / batch'],
              ['cgpa', 'CGPA (0-10)'],
              ['activeBacklogs', 'Active backlogs'],
              ['tenthPercentage', '10th percentage (0-100)'],
              ['twelfthPercentage', '12th percentage (0-100)'],
              ['skills', 'Skills (comma separated)'],
            ] as [keyof ProfileForm, string][]).map(([field, label]) => (
              <View key={field}>
                <Text style={styles.editorLabel}>{label}</Text>
                <TextInput
                  style={styles.editorInput}
                  value={form[field]}
                  onChangeText={(value) => updateForm(field, value)}
                  keyboardType={['cgpa', 'activeBacklogs', 'tenthPercentage', 'twelfthPercentage'].includes(field) ? 'decimal-pad' : 'default'}
                  autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                  editable={!saving}
                />
              </View>
            ))}
            <View style={styles.editorActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)} disabled={saving}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => void saveProfile()} disabled={saving}>
                {saving ? <ActivityIndicator color={COLORS.textInverse} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      )}
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
  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  editButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryAccent,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  editorContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  editorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  editorSubtitle: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.lg,
  },
  editorLabel: {
    ...TYPOGRAPHY.bodyBold,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  editorInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  editorActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.md,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  saveButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
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
