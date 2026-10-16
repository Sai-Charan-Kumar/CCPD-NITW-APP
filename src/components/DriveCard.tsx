import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Briefcase, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { PlacementDrive } from '../types';
import { StatusBadge } from './StatusBadge';

interface DriveCardProps {
  drive: PlacementDrive;
  isEligible: boolean;
  isApplied?: boolean;
  onPress: () => void;
}

export const DriveCard: React.FC<DriveCardProps> = ({
  drive,
  isEligible,
  isApplied = false,
  onPress,
}) => {
  // Format deadline date to readable
  const deadlineDate = new Date(drive.registrationDeadline);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Banner Row */}
      <View style={styles.headerRow}>
        <View style={styles.companyInfo}>
          <View style={[styles.logoContainer, { backgroundColor: `${drive.accentColor}18` }]}>
            <Text style={[styles.logoText, { color: drive.accentColor }]}>
              {drive.companyName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.nameCategory}>
            <Text style={styles.companyName} numberOfLines={1}>
              {drive.companyName}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {drive.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Role Title */}
      <Text style={styles.role} numberOfLines={2}>
        {drive.role}
      </Text>

      {/* CTC & Job Type Section */}
      <View style={styles.ctcContainer}>
        <View style={styles.ctcBox}>
          <Text style={styles.ctcLabel}>Total CTC</Text>
          <Text style={styles.ctcValue}>{drive.salary.ctcDisplay}</Text>
        </View>

        <View style={styles.jobTypePill}>
          <Briefcase size={12} color={COLORS.textSecondary} />
          <Text style={styles.jobTypeText}>{drive.jobType}</Text>
        </View>
      </View>

      {/* Meta Info Row: Location & Deadline */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={13} color={COLORS.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {drive.workMode} • {drive.location}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Clock size={13} color={drive.status === 'deadline_near' ? COLORS.danger : COLORS.textMuted} />
          <Text
            style={[
              styles.metaText,
              drive.status === 'deadline_near' && { color: COLORS.danger, fontWeight: '600' },
            ]}
          >
            Apply by {formattedDeadline}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Status & Eligibility Row */}
      <View style={styles.footerRow}>
        <View style={styles.eligibilityRow}>
          <StatusBadge
            type="eligibility"
            value={isEligible ? 'Eligible' : 'Not Eligible'}
            size="small"
          />
          <Text style={styles.cgpaRequirement}>
            Min CGPA {drive.eligibility.minCgpa.toFixed(1)}
          </Text>
        </View>

        {isApplied ? (
          <View style={styles.appliedPill}>
            <CheckCircle2 size={13} color={COLORS.successDark} />
            <Text style={styles.appliedText}>Applied</Text>
          </View>
        ) : (
          <StatusBadge type="driveStatus" value={drive.status} size="small" />
        )}
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  logoText: {
    fontWeight: '800',
    fontSize: 16,
  },
  nameCategory: {
    flex: 1,
  },
  companyName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  category: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  role: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  ctcContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  ctcBox: {
    flexDirection: 'column',
  },
  ctcLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctcValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryAccent,
  },
  jobTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  jobTypeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cgpaRequirement: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  appliedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    gap: 4,
  },
  appliedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.successDark,
  },
});
