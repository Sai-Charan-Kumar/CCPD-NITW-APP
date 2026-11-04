import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  Send,
  ChevronDown,
  Megaphone,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';
import { PlacementStatistics, RegisteredStudent } from '../../types';
import { getApiErrorMessage } from '../../api/axiosClient';

export const CcpdHeadDashboardScreen: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState<PlacementStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // Notice State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all_students' | 'company_group'>('all_students');
  const [recipientDrives, setRecipientDrives] = useState<{ id: string; companyName: string; role: string }[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void placementService.getNoticeRecipientDrives()
      .then(setRecipientDrives)
      .catch((error) => console.error('Failed to load notice recipient drives', error));
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await placementService.getPlacementStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load placement stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudents(await placementService.getRegisteredStudents());
      } catch (err) {
        console.error('Failed to load registered students', err);
      } finally {
        setStudentsLoading(false);
      }
    };
    void loadStudents();
  }, []);

  const handleTnpAccessChange = async (student: RegisteredStudent, enabled: boolean) => {
    try {
      await placementService.updateTnpAccess(student.id, enabled);
      setStudents((current) => current.map((item) => (
        item.id === student.id ? { ...item, tnpAccess: enabled } : item
      )));
    } catch (error) {
      Alert.alert('Unable to update T&P access', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleSendGlobalNotice = async () => {
    if (!noticeTitle.trim() || !noticeMessage.trim() || (recipientType === 'company_group' && !selectedDriveId)) {
      Alert.alert('Incomplete Notice', 'Please provide both title and announcement content.');
      return;
    }

    setSending(true);
    try {
      const result = await placementService.sendNotice({
        title: noticeTitle.trim(),
        content: noticeMessage.trim(),
        recipientType,
        driveId: recipientType === 'company_group' ? selectedDriveId : undefined,
      });
      Alert.alert('Notice processed', result.message);
      setNoticeTitle('');
      setNoticeMessage('');
    } catch (error) {
      Alert.alert('Unable to send notice', getApiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Executive Welcome Card */}
      <View style={[styles.executiveCard, SHADOWS.card]}>
        <Text style={styles.directorateTag}>Directorate of CCPD</Text>
        <Text style={styles.executiveTitle}>Campus Placement Executive Dashboard</Text>
        <Text style={styles.executiveSubtitle}>
          Academic Year {stats.academicYear} • {stats.totalOffers} Total Offers Extended ({stats.placementPercentage}% Overall Placed)
        </Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{stats.highestPackage}</Text>
            <Text style={styles.kpiLabel}>Highest Package</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{stats.averagePackage}</Text>
            <Text style={styles.kpiLabel}>Average CTC</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{stats.totalOffers}</Text>
            <Text style={styles.kpiLabel}>Offers Released</Text>
          </View>
        </View>
      </View>

      {/* Notice Broadcast Card */}
      <View style={[styles.broadcastCard, SHADOWS.card]}>
        <View style={styles.broadcastHeader}>
          <Megaphone size={20} color={COLORS.purple} />
          <Text style={styles.cardTitle}>Notice</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Issue institutional policy directives, holiday schedules, and recruitment updates with institute-wide reach.
        </Text>

        {/* Notice Title */}
        <Text style={styles.inputLabel}>Notice Title *</Text>
        <TextInput
          style={styles.input}
          placeholder={`e.g. Mandatory Pre-Placement Briefing for ${currentYear} Graduating Batch`}
          placeholderTextColor={COLORS.textMuted}
          value={noticeTitle}
          onChangeText={setNoticeTitle}
        />

        <Text style={styles.inputLabel}>Recipients *</Text>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setShowAudienceModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownBtnText}>{recipientType === 'all_students' ? 'All Students' : recipientDrives.find((drive) => drive.id === selectedDriveId)?.companyName || 'Company-Specific Group'}</Text>
          <ChevronDown size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Message Text Area */}
        <Text style={styles.inputLabel}>Notice Body & Instructions *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Type official CCPD gazette directives or instructions..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          value={noticeMessage}
          onChangeText={setNoticeMessage}
          textAlignVertical="top"
        />
        {recipientType === 'company_group' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.driveSelectorScroll}>
            {recipientDrives.map((drive) => (
              <TouchableOpacity key={drive.id} style={[styles.driveSelectorPill, selectedDriveId === drive.id && styles.driveSelectorPillActive]} onPress={() => setSelectedDriveId(drive.id)}>
                <Text style={[styles.drivePillText, selectedDriveId === drive.id && styles.drivePillTextActive]}>{drive.companyName} - {drive.role}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendGlobalNotice}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <>
              <Send size={16} color={COLORS.textInverse} />
              <Text style={styles.sendBtnText}>Send Notice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.sectionCard, SHADOWS.card]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Registered Students & T&P Access</Text>
        </View>

        {studentsLoading ? (
          <ActivityIndicator size="small" color={COLORS.purple} />
        ) : students.length === 0 ? (
          <Text style={styles.emptyText}>No registered students found.</Text>
        ) : (
          students.map((student) => (
            <View key={student.id} style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMeta}>{student.email} • {student.department || 'Department pending'}</Text>
                <Text style={styles.studentMeta}>Roll No: {student.rollNumber || 'Not provided'} • CGPA: {student.cgpa.toFixed(2)}</Text>
              </View>
              <View style={styles.accessControl}>
                <Text style={styles.accessLabel}>{student.tnpAccess ? 'T&P' : 'Student'}</Text>
                <Switch
                  value={student.tnpAccess}
                  onValueChange={(enabled) => void handleTnpAccessChange(student, enabled)}
                  trackColor={{ false: COLORS.border, true: COLORS.purple }}
                  thumbColor={COLORS.surface}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={showAudienceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <Text style={styles.modalTitle}>Select Recipients</Text>
            {[
              ['all_students', 'All Students'],
              ['company_group', 'Company-Specific Group'],
            ].map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={styles.modalItem}
                  onPress={() => {
                    setRecipientType(value as 'all_students' | 'company_group');
                    setShowAudienceModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{label}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAudienceModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  executiveCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  directorateTag: {
    ...TYPOGRAPHY.caption,
    color: '#93C5FD',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  executiveTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textInverse,
    marginTop: 2,
    marginBottom: 4,
  },
  executiveSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#E0E7FF',
    marginBottom: SPACING.lg,
    lineHeight: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#E0E7FF',
    marginTop: 2,
    textAlign: 'center',
  },
  broadcastCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
    marginBottom: SPACING.md,
  },
  broadcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  driveSelectorScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  driveSelectorPill: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  driveSelectorPillActive: {
    backgroundColor: COLORS.purpleLight,
    borderColor: COLORS.purple,
  },
  drivePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  drivePillTextActive: {
    color: COLORS.purple,
    fontWeight: '700',
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingRight: 42,
    height: 48,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: SPACING.md,
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  permissionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tealLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  permissionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.successDark,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  successText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.successDark,
    fontWeight: '600',
    flex: 1,
  },
  candidateAvatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  candidateAvatarText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  candidateMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  promoteBtn: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    minWidth: 76,
    alignItems: 'center',
  },
  promoteBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  noCandidatesText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    flex: 1,
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
    marginTop: SPACING.md,
  },
  rosterTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  rosterSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  coordinatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  tnpBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.teal,
    fontWeight: '700',
    marginTop: 3,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  emptySearchState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    marginBottom: SPACING.sm,
  },
  dropdownBtnText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    height: 96,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.purpleBorder,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.purple,
    fontWeight: '600',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    height: 46,
    marginTop: SPACING.sm,
    gap: 8,
  },
  sendBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  coordinatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coordinatorIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.tealLight,
    marginRight: SPACING.md,
  },
  coordinatorHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  studentInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  studentName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  studentMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  accessControl: {
    alignItems: 'center',
  },
  accessLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.purple,
    fontWeight: '700',
    marginBottom: 2,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  modalItemSelected: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  modalItemText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  modalItemTextSelected: {
    fontWeight: '700',
    color: COLORS.purple,
  },
  modalCloseBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalCloseBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});
