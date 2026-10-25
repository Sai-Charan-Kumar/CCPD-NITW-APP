import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { CheckCircle2, XCircle, AlertCircle, X, ShieldCheck } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { PlacementDrive, StudentProfile } from '../types';
import { placementService } from '../data/placementService';

interface EligibilityModalProps {
  visible: boolean;
  onClose: () => void;
  drive: PlacementDrive;
  student: StudentProfile;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  visible,
  onClose,
  drive,
  student,
}) => {
  const { isEligible } = placementService.checkEligibility(student, drive);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, SHADOWS.modal]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <ShieldCheck size={20} color={isEligible ? COLORS.successDark : COLORS.danger} />
              <Text style={styles.modalTitle}>Eligibility Breakdown</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Status Summary Banner */}
            <View
              style={[
                styles.summaryBanner,
                {
                  backgroundColor: isEligible ? COLORS.successLight : COLORS.dangerLight,
                  borderColor: isEligible ? COLORS.successBorder : COLORS.dangerBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryTitle,
                  { color: isEligible ? COLORS.successDark : COLORS.dangerDark },
                ]}
              >
                {isEligible
                  ? 'You are eligible to apply for this drive!'
                  : 'You do not meet the criteria for this drive'}
              </Text>
              <Text
                style={[
                  styles.summarySubtitle,
                  { color: isEligible ? COLORS.successDark : COLORS.dangerDark },
                ]}
              >
                {isEligible
                  ? 'Your academic credentials meet all requirements set by CCPD and the hiring partner.'
                  : 'Review the unmet criteria below as verified from institute records.'}
              </Text>
            </View>

            {/* Criteria Checklist */}
            <Text style={styles.sectionHeader}>Criteria Verification</Text>

            {/* CGPA */}
            <View style={styles.criteriaItem}>
              {student.cgpa >= drive.eligibility.minCgpa ? (
                <CheckCircle2 size={18} color={COLORS.success} />
              ) : (
                <XCircle size={18} color={COLORS.danger} />
              )}
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Minimum CGPA</Text>
                <Text style={styles.criteriaValue}>
                  Required: {drive.eligibility.minCgpa.toFixed(2)} | Yours: {student.cgpa.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Allowed Branches */}
            <View style={styles.criteriaItem}>
              {drive.eligibility.allowedDepartments.includes(student.department) ? (
                <CheckCircle2 size={18} color={COLORS.success} />
              ) : (
                <XCircle size={18} color={COLORS.danger} />
              )}
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Eligible Departments</Text>
                <Text style={styles.criteriaValue}>
                  Your Branch: {student.department}
                </Text>
                <Text style={styles.branchesList}>
                  Allowed: {drive.eligibility.allowedDepartments.join(', ')}
                </Text>
              </View>
            </View>

            {/* Active Backlogs */}
            <View style={styles.criteriaItem}>
              {student.activeBacklogs <= drive.eligibility.maxActiveBacklogs ? (
                <CheckCircle2 size={18} color={COLORS.success} />
              ) : (
                <XCircle size={18} color={COLORS.danger} />
              )}
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Active Backlogs</Text>
                <Text style={styles.criteriaValue}>
                  Max Permitted: {drive.eligibility.maxActiveBacklogs} | Your Backlogs: {student.activeBacklogs}
                </Text>
              </View>
            </View>

            {/* 10th & 12th */}
            <View style={styles.criteriaItem}>
              {student.tenthPercentage >= drive.eligibility.minTenthMarks &&
              student.twelfthPercentage >= drive.eligibility.minTwelfthMarks ? (
                <CheckCircle2 size={18} color={COLORS.success} />
              ) : (
                <XCircle size={18} color={COLORS.danger} />
              )}
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>Secondary & Higher Secondary</Text>
                <Text style={styles.criteriaValue}>
                  10th: {student.tenthPercentage}% (Min {drive.eligibility.minTenthMarks}%) • 12th: {student.twelfthPercentage}% (Min {drive.eligibility.minTwelfthMarks}%)
                </Text>
              </View>
            </View>

            {/* CCPD Verification */}
            <View style={styles.criteriaItem}>
              {student.isVerifiedByCCPD ? (
                <CheckCircle2 size={18} color={COLORS.success} />
              ) : (
                <XCircle size={18} color={COLORS.danger} />
              )}
              <View style={styles.criteriaContent}>
                <Text style={styles.criteriaLabel}>CCPD Verification Status</Text>
                <Text style={styles.criteriaValue}>
                  {student.isVerifiedByCCPD
                    ? 'Verified by Center for Corporate & Professional Development'
                    : 'Pending verification at CCPD office'}
                </Text>
              </View>
            </View>

            {/* CCPD Policy Note */}
            <View style={styles.policyNote}>
              <AlertCircle size={14} color={COLORS.primaryAccent} />
              <Text style={styles.policyText}>
                As per institute rules, false claims or discrepancies with grade cards will lead to disciplinary debarment from placements.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
              <Text style={styles.closeModalBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '82%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  bodyScroll: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  summaryBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: 4,
  },
  summarySubtitle: {
    ...TYPOGRAPHY.bodySmall,
  },
  sectionHeader: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  criteriaContent: {
    flex: 1,
  },
  criteriaLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  criteriaValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  branchesList: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  policyNote: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  policyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  closeModalBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  closeModalBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
  },
});
