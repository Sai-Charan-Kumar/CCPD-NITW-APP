import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, Award, Clock } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Application } from '../types';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  const completedRoundsCount = application.timeline.filter((r) => r.status === 'passed').length;
  const totalRounds = application.timeline.length;
  const progressRatio = totalRounds > 0 ? completedRoundsCount / totalRounds : 0;
  const isOffer =
    application.status === 'Offer Extended' || application.status === 'Offer Accepted';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        SHADOWS.card,
        isOffer && { borderColor: COLORS.success, borderWidth: 1.5 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.companyRow}>
          <View
            style={[
              styles.logoBox,
              { backgroundColor: isOffer ? COLORS.successLight : `${application.accentColor}18` },
            ]}
          >
            {isOffer ? (
              <Award size={20} color={COLORS.successDark} />
            ) : (
              <Text style={[styles.logoText, { color: application.accentColor }]}>
                {application.companyName.slice(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.companyName} numberOfLines={1}>
              {application.companyName}
            </Text>
            <Text style={styles.appliedDate}>Applied on {application.appliedDate}</Text>
          </View>
        </View>

        <StatusBadge type="applicationStatus" value={application.status} size="small" />
      </View>

      {/* Role & CTC */}
      <View style={styles.roleRow}>
        <Text style={styles.role} numberOfLines={1}>
          {application.role}
        </Text>
        <Text style={styles.ctc}>{application.salaryDisplay}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Recruitment Progress</Text>
          <Text style={styles.progressCount}>
            {completedRoundsCount} of {totalRounds} stages cleared
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.round(progressRatio * 100)}%`,
                backgroundColor: isOffer ? COLORS.success : COLORS.primaryAccent,
              },
            ]}
          />
        </View>
      </View>

      {/* Current Round & Next Step Info */}
      <View style={styles.nextStepBox}>
        <View style={styles.nextStepLeft}>
          <Clock size={13} color={COLORS.primaryAccent} />
          <View style={styles.nextStepTextContainer}>
            <Text style={styles.currentRoundLabel}>Current Round:</Text>
            <Text style={styles.currentRoundValue} numberOfLines={1}>
              {application.currentRound}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={COLORS.textMuted} />
      </View>

      {/* Next event note if available */}
      {application.nextEventDate && (
        <View style={styles.eventNotice}>
          <Calendar size={12} color={COLORS.warningDark} />
          <Text style={styles.eventNoticeText} numberOfLines={1}>
            {application.nextEventDate}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '800',
  },
  titleColumn: {
    flex: 1,
  },
  companyName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  appliedDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  role: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  ctc: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primaryAccent,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  nextStepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  nextStepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  nextStepTextContainer: {
    flex: 1,
  },
  currentRoundLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  currentRoundValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  eventNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warningDark,
    fontWeight: '600',
    flex: 1,
  },
});
