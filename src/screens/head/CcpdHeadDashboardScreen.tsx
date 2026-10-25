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
  Platform,
} from 'react-native';
import {
  Mail,
  Send,
  Building2,
  ChevronDown,
  Check,
  Megaphone,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';
import { PlacementStatistics } from '../../types';

const AUDIENCES = ['All Students (UG & PG)', 'All 4th Years (Batch 2026)', 'All TnPs & Coordinators', 'CSE & ECE Only'];

export const CcpdHeadDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<PlacementStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Notice Broadcast State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState(AUDIENCES[1]);
  const [sendEmailAlso, setSendEmailAlso] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [sending, setSending] = useState(false);

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

  const handleSendGlobalNotice = async () => {
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      Alert.alert('Incomplete Notice', 'Please provide both title and announcement content.');
      return;
    }

    setSending(true);
    await new Promise((r) => setTimeout(r, 450));
    setSending(false);

    if (sendEmailAlso) {
      Alert.alert(
        'Global Notice Dispatched',
        `Official CCPD notification issued to "${targetAudience}" & automated emails dispatched to all registered IDs.`
      );
    } else {
      Alert.alert(
        'Global Notice Published',
        `Official CCPD notice published to the student portal for "${targetAudience}".`
      );
    }

    setNoticeTitle('');
    setNoticeMessage('');
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

      {/* Global Notice Broadcast Card */}
      <View style={[styles.broadcastCard, SHADOWS.card]}>
        <View style={styles.broadcastHeader}>
          <Megaphone size={20} color={COLORS.purple} />
          <Text style={styles.cardTitle}>Global Notice Broadcast</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Issue institutional policy directives, holiday schedules, and recruitment updates with institute-wide reach.
        </Text>

        {/* Notice Title */}
        <Text style={styles.inputLabel}>Notice Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mandatory Pre-Placement Briefing for 2026 Graduating Batch"
          placeholderTextColor={COLORS.textMuted}
          value={noticeTitle}
          onChangeText={setNoticeTitle}
        />

        {/* Target Audience Dropdown */}
        <Text style={styles.inputLabel}>Target Audience *</Text>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setShowAudienceModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownBtnText}>{targetAudience}</Text>
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

        {/* Toggle: Send notice via Email also */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Mail size={16} color={COLORS.purple} />
            <Text style={styles.toggleLabel}>Send notice via Email also</Text>
          </View>
          <Switch
            value={sendEmailAlso}
            onValueChange={setSendEmailAlso}
            trackColor={{ false: COLORS.border, true: COLORS.purple }}
            thumbColor={Platform.OS === 'android' ? COLORS.surface : undefined}
          />
        </View>

        {/* Action Button: Send Global Notice */}
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
              <Text style={styles.sendBtnText}>Send Global Notice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Top Recruiters Snapshot */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <View style={styles.sectionHeaderRow}>
          <Building2 size={18} color={COLORS.primaryAccent} />
          <Text style={styles.sectionTitle}>Key Hiring Corporate Partners</Text>
        </View>

        {stats.topRecruiters.slice(0, 5).map((r, idx) => (
          <View key={idx} style={styles.recruiterRow}>
            <Text style={styles.recruiterName}>{r.name}</Text>
            <Text style={styles.recruiterOffers}>{r.offersCount} offers</Text>
            <Text style={styles.recruiterCtc}>{r.highestPackage}</Text>
          </View>
        ))}
      </View>

      {/* Target Audience Modal */}
      <Modal visible={showAudienceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <Text style={styles.modalTitle}>Select Target Audience</Text>
            {AUDIENCES.map((a) => {
              const isSelected = targetAudience === a;
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                  onPress={() => {
                    setTargetAudience(a);
                    setShowAudienceModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                    {a}
                  </Text>
                  {isSelected && <Check size={18} color={COLORS.purple} />}
                </TouchableOpacity>
              );
            })}
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
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  recruiterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  recruiterName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
    flex: 2,
  },
  recruiterOffers: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  recruiterCtc: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryAccent,
    fontSize: 13,
    flex: 1.5,
    textAlign: 'right',
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
