import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Megaphone,
  Send,
  Users,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';
import { useAuth } from '../../context/AuthContext';
import { PlacementDrive, RootStackParamList, StudentProfile } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/Header';
import { getApiErrorMessage } from '../../api/axiosClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TnpDriveManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, setTnpMode } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Notice State
  const [recipientType, setRecipientType] = useState<'all_students' | 'company_group'>('all_students');
  const [recipientDrives, setRecipientDrives] = useState<{ id: string; companyName: string; role: string }[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadDrives = useCallback(async () => {
    const data = await placementService.getDrives();
    setDrives(data);
    setSelectedDriveId((current) => current && data.some((drive) => drive.id === current) ? current : data[0]?.id || '');
  }, []);

  useFocusEffect(useCallback(() => {
    void loadDrives().catch((error) => {
      console.error('Failed to refresh drive application counts', error);
    });
  }, [loadDrives]));

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, studentData, unread, noticeDrives] = await Promise.all([
          placementService.getDrives(),
          placementService.getStudentProfile(),
          placementService.getUnreadNoticesCount(),
          placementService.getNoticeRecipientDrives(),
        ]);
        setDrives(data);
        setStudent(studentData);
        setUnreadCount(unread);
        setRecipientDrives(noticeDrives);
        if (data.length > 0) {
          setSelectedDriveId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load TnP data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteDrive = (drive: PlacementDrive) => {
    Alert.alert(
      'Delete drive?',
      `This will permanently remove ${drive.companyName} - ${drive.role}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await placementService.deleteDrive(drive.id);
              await loadDrives();
              Alert.alert('Drive deleted', 'The drive has been removed.');
            } catch (error) {
              Alert.alert('Could not delete drive', getApiErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const handleSendAnnouncement = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim() || (recipientType === 'company_group' && !selectedDriveId)) {
      Alert.alert('Incomplete Notice', 'Please provide a title, message, and recipient group.');
      return;
    }

    setSending(true);
    try {
      const result = await placementService.sendNotice({
        title: broadcastTitle.trim(),
        content: broadcastMessage.trim(),
        recipientType,
        driveId: recipientType === 'company_group' ? selectedDriveId : undefined,
      });
      Alert.alert('Notice processed', result.message);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (error) {
      Alert.alert('Unable to send notice', getApiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {student && (
        <Header
          student={student}
          currentUser={currentUser}
          unreadCount={unreadCount}
          onPressNotifications={() => navigation.navigate('Notifications')}
        />
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <TouchableOpacity style={styles.modeButton} onPress={() => setTnpMode('student')}>
        <Text style={styles.modeButtonText}>Switch to user mode</Text>
      </TouchableOpacity>
      {/* Notice Section */}
      <View style={[styles.broadcastCard, SHADOWS.card]}>
        <View style={styles.broadcastHeader}>
          <Megaphone size={20} color={COLORS.primaryAccent} />
          <Text style={styles.cardTitle}>Notice</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Dispatch urgent announcements, slot timings, and test links to shortlisted candidates.
        </Text>

        <Text style={styles.inputLabel}>Recipients *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.driveSelectorScroll}
        >
          {[
            { id: 'all', companyName: 'All Students', role: '' },
            ...recipientDrives
          ].map((d) => {
            const isSelected = d.id === 'all'
              ? recipientType === 'all_students'
              : recipientType === 'company_group' && selectedDriveId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.driveSelectorPill, isSelected && styles.driveSelectorPillActive]}
                onPress={() => {
                  if (d.id === 'all') {
                    setRecipientType('all_students');
                  } else {
                    setRecipientType('company_group');
                    setSelectedDriveId(d.id);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.drivePillText, isSelected && styles.drivePillTextActive]}
                  numberOfLines={1}
                >
                  {d.companyName}{d.role ? ` - ${d.role}` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Announcement Title */}
        <Text style={styles.inputLabel}>Notice Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. OA shortlist and reporting instructions"
          placeholderTextColor={COLORS.textMuted}
          value={broadcastTitle}
          onChangeText={setBroadcastTitle}
        />

        {/* Message Textarea */}
        <Text style={styles.inputLabel}>Announcement Message *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Type announcement instructions, reporting venue, and proctoring guidelines..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          value={broadcastMessage}
          onChangeText={setBroadcastMessage}
          textAlignVertical="top"
        />

        {/* Send Action Button */}
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendAnnouncement}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <>
              <Send size={16} color={COLORS.textInverse} />
              <Text style={styles.sendBtnText}>Send Announcement</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Campus Drives Summary */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <View style={styles.sectionHeaderRow}>
          <Briefcase size={18} color={COLORS.primaryAccent} />
          <Text style={styles.sectionTitle}>Active Recruitment Drives ({drives.length})</Text>
        </View>

        {drives.map((drive) => (
          <View
            key={drive.id}
            style={styles.driveRow}
          >
            <View style={styles.driveMain}>
              <Text style={styles.driveCompanyName}>{drive.companyName}</Text>
              <Text style={styles.driveRole} numberOfLines={1}>
                {drive.role}
              </Text>
              <Text style={styles.driveDeadline}>
                Deadline: {new Date(drive.registrationDeadline).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.driveApplicantsBox}>
              <Users size={14} color={COLORS.primaryAccent} />
              <Text style={styles.driveApplicantsCount}>{drive.appliedCount} Applied</Text>
            </View>
            <View style={styles.driveActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('CreateDrive', { driveId: drive.id })}
                accessibilityLabel={`Edit ${drive.companyName} drive`}
              >
                <Pencil size={16} color={COLORS.primaryAccent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={() => handleDeleteDrive(drive)}
                accessibilityLabel={`Delete ${drive.companyName} drive`}
              >
                <Trash2 size={16} color={COLORS.danger} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manageLink}
                onPress={() => navigation.navigate('DriveAdmin', { driveId: drive.id })}
              >
                <Text style={styles.manageLinkText}>Manage</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateDrive')}
        activeOpacity={0.85}
      >
        <Plus size={20} color={COLORS.textInverse} />
        <Text style={styles.createButtonText}>Create New Drive</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modeButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_RESERVED_HEIGHT,
  },
  createButton: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  createButtonText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  broadcastCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  driveSelectorScroll: {
    gap: 8,
    paddingBottom: SPACING.sm,
  },
  driveSelectorPill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  driveSelectorPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  drivePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  drivePillTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
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
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryAccent,
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
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  driveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  driveMain: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  driveCompanyName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  driveRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  driveDeadline: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  driveApplicantsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  driveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  deleteButton: {
    backgroundColor: COLORS.dangerLight,
  },
  manageLink: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  manageLinkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  driveApplicantsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryAccent,
  },
});
