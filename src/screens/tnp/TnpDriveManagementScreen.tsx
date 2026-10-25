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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Megaphone,
  Mail,
  Send,
  Users,
  Briefcase,
  Plus,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';
import { PlacementDrive, RootStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TnpDriveManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Tool State
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendEmailAlso, setSendEmailAlso] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await placementService.getDrives();
        setDrives(data);
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

  const handleSendAnnouncement = async () => {
    if (!broadcastMessage.trim()) {
      Alert.alert('Incomplete Message', 'Please enter an announcement message.');
      return;
    }

    setSending(true);
    // Simulate network dispatch
    await new Promise((r) => setTimeout(r, 400));
    setSending(false);

    const activeDrive = drives.find((d) => d.id === selectedDriveId);
    const driveName = activeDrive ? activeDrive.companyName : 'all active applicants';

    if (sendEmailAlso) {
      Alert.alert(
        'Broadcast Dispatched',
        `Message broadcasted to group & Emails dispatched to ${activeDrive?.appliedCount || 140} registered students for ${driveName}.`
      );
    } else {
      Alert.alert(
        'Broadcast Published',
        `Message broadcasted to in-app notification center for ${driveName} applicants.`
      );
    }

    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  if (loading) {
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
      {/* Broadcast Tool Section */}
      <View style={[styles.broadcastCard, SHADOWS.card]}>
        <View style={styles.broadcastHeader}>
          <Megaphone size={20} color={COLORS.primaryAccent} />
          <Text style={styles.cardTitle}>Broadcast Tool</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Dispatch urgent announcements, slot timings, and test links to shortlisted candidates.
        </Text>

        {/* Target Drive Selector */}
        <Text style={styles.inputLabel}>Select Applicant Pool / Drive</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.driveSelectorScroll}
        >
          {drives.map((d) => {
            const isSelected = selectedDriveId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.driveSelectorPill, isSelected && styles.driveSelectorPillActive]}
                onPress={() => setSelectedDriveId(d.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.drivePillText, isSelected && styles.drivePillTextActive]}
                  numberOfLines={1}
                >
                  {d.companyName} ({d.appliedCount})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Announcement Title */}
        <Text style={styles.inputLabel}>Subject / Headline (Optional)</Text>
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

        {/* Toggle: Send notice via Email also */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Mail size={16} color={COLORS.primaryAccent} />
            <Text style={styles.toggleLabel}>Send notice via Email also</Text>
          </View>
          <Switch
            value={sendEmailAlso}
            onValueChange={setSendEmailAlso}
            trackColor={{ false: COLORS.border, true: COLORS.primaryAccent }}
            thumbColor={Platform.OS === 'android' ? COLORS.surface : undefined}
          />
        </View>

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
          <TouchableOpacity
            key={drive.id}
            style={styles.driveRow}
            onPress={() => navigation.navigate('DriveAdmin', { driveId: drive.id })}
            activeOpacity={0.75}
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
          </TouchableOpacity>
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
    paddingBottom: SPACING.xxxl,
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
  driveApplicantsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryAccent,
  },
});
