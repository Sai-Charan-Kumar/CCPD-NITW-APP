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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { StatusBadge } from '../components/StatusBadge';
import { EligibilityModal } from '../components/EligibilityModal';
import { placementService } from '../data/placementService';
import { PlacementDrive, StudentProfile, RootStackParamList } from '../types';

type JobDetailRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;

export const JobDetailScreen: React.FC = () => {
  const route = useRoute<JobDetailRouteProp>();
  const navigation = useNavigation();
  const { driveId } = route.params;

  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [driveData, studentData, applied] = await Promise.all([
          placementService.getDriveById(driveId),
          placementService.getStudentProfile(),
          placementService.isApplied(driveId),
        ]);
        setDrive(driveData || null);
        setStudent(studentData);
        setIsApplied(applied);
      } catch (err) {
        console.error('Failed to load drive details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [driveId]);

  if (loading || !drive || !student) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { isEligible, reasons } = placementService.checkEligibility(student, drive);

  const handleApply = async () => {
    if (!isEligible) {
      Alert.alert('Ineligible for this Drive', reasons.join('\n\n'));
      return;
    }

    Alert.alert(
      'Confirm Campus Application',
      `You are applying for ${drive.role} at ${drive.companyName}.\n\nYour verified profile (CGPA: ${student.cgpa.toFixed(2)}) and resume will be submitted to the CCPD corporate portal.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Application',
          onPress: async () => {
            setApplying(true);
            const res = await placementService.applyToDrive(drive.id);
            setApplying(false);
            if (res.success) {
              setIsApplied(true);
              Alert.alert('Application Submitted!', res.message);
            } else {
              Alert.alert('Application Failed', res.message);
            }
          },
        },
      ]
    );
  };

  const deadlineDate = new Date(drive.registrationDeadline);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card */}
        <View style={[styles.headerCard, SHADOWS.card]}>
          <View style={styles.companyRow}>
            <View style={[styles.logoBox, { backgroundColor: `${drive.accentColor}18` }]}>
              <Text style={[styles.logoText, { color: drive.accentColor }]}>
                {drive.companyName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.companyMeta}>
              <Text style={styles.companyName}>{drive.companyName}</Text>
              <Text style={styles.category}>{drive.category}</Text>
            </View>
            <StatusBadge type="driveStatus" value={drive.status} />
          </View>

          <Text style={styles.roleTitle}>{drive.role}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Briefcase size={13} color={COLORS.textSecondary} />
              <Text style={styles.metaChipText}>{drive.jobType}</Text>
            </View>
            <View style={styles.metaChip}>
              <MapPin size={13} color={COLORS.textSecondary} />
              <Text style={styles.metaChipText}>
                {drive.workMode} • {drive.location}
              </Text>
            </View>
          </View>

          <View style={styles.deadlineContainer}>
            <Clock size={13} color={COLORS.danger} />
            <Text style={styles.deadlineText}>Deadline: {formattedDeadline}</Text>
          </View>
        </View>

        {/* Salary & CTC Breakdown Card */}
        <View style={[styles.sectionCard, SHADOWS.card]}>
          <Text style={styles.cardHeader}>Compensation Package</Text>

          <View style={styles.ctcHighlightBox}>
            <Text style={styles.ctcHighlightLabel}>Cost to Company (CTC)</Text>
            <Text style={styles.ctcHighlightValue}>{drive.salary.ctcDisplay}</Text>
          </View>

          <View style={styles.salaryGrid}>
            <View style={styles.salaryRow}>
              <Text style={styles.salaryRowLabel}>Base Salary</Text>
              <Text style={styles.salaryRowValue}>{drive.salary.baseSalary}</Text>
            </View>
            {drive.salary.joiningBonus && (
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>Joining Bonus</Text>
                <Text style={styles.salaryRowValue}>{drive.salary.joiningBonus}</Text>
              </View>
            )}
            {drive.salary.performanceBonus && (
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>Performance Bonus</Text>
                <Text style={styles.salaryRowValue}>{drive.salary.performanceBonus}</Text>
              </View>
            )}
            {drive.salary.stocksOrEsops && (
              <View style={styles.salaryRow}>
                <Text style={styles.salaryRowLabel}>Stocks / Equity</Text>
                <Text style={styles.salaryRowValue}>{drive.salary.stocksOrEsops}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Eligibility Verification Card */}
        <TouchableOpacity
          style={[styles.sectionCard, SHADOWS.card]}
          onPress={() => setShowEligibilityModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.eligibilityHeader}>
            <View style={styles.eligibilityTitleRow}>
              <ShieldCheck
                size={20}
                color={isEligible ? COLORS.successDark : COLORS.danger}
              />
              <Text style={styles.cardHeader}>Eligibility Status</Text>
            </View>
            <View style={styles.checkPill}>
              <Text style={styles.checkPillText}>Check Breakdown</Text>
              <ChevronRight size={14} color={COLORS.primaryAccent} />
            </View>
          </View>

          <View
            style={[
              styles.eligibilityStatusBox,
              {
                backgroundColor: isEligible ? COLORS.successLight : COLORS.dangerLight,
                borderColor: isEligible ? COLORS.successBorder : COLORS.dangerBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.eligibilityStatusTitle,
                { color: isEligible ? COLORS.successDark : COLORS.dangerDark },
              ]}
            >
              {isEligible ? 'You meet all requirements' : 'Criteria unmet'}
            </Text>
            <Text
              style={[
                styles.eligibilityStatusDesc,
                { color: isEligible ? COLORS.successDark : COLORS.dangerDark },
              ]}
            >
              {isEligible
                ? `Min CGPA: ${drive.eligibility.minCgpa.toFixed(1)} • Max Backlogs: ${drive.eligibility.maxActiveBacklogs}`
                : reasons[0]}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Selection Process */}
        <View style={[styles.sectionCard, SHADOWS.card]}>
          <Text style={styles.cardHeader}>Recruitment Process</Text>
          <Text style={styles.sectionDesc}>
            The drive consists of {drive.selectionRounds.length} stages scheduled through CCPD.
          </Text>

          {drive.selectionRounds.map((round) => (
            <View key={round.id} style={styles.roundItem}>
              <View style={styles.roundNumberCircle}>
                <Text style={styles.roundNumberText}>{round.roundNumber}</Text>
              </View>
              <View style={styles.roundContent}>
                <Text style={styles.roundName}>{round.name}</Text>
                <Text style={styles.roundDate}>
                  {round.tentativeDate} • {round.venueOrPlatform}
                </Text>
                <Text style={styles.roundDesc}>{round.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Job Description */}
        <View style={[styles.sectionCard, SHADOWS.card]}>
          <Text style={styles.cardHeader}>About the Role</Text>
          <Text style={styles.bodyText}>{drive.description}</Text>

          <Text style={[styles.subHeader, { marginTop: SPACING.md }]}>Key Responsibilities</Text>
          {drive.responsibilities.map((resp, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{resp}</Text>
            </View>
          ))}

          <Text style={[styles.subHeader, { marginTop: SPACING.md }]}>Required Skills & Tech</Text>
          <View style={styles.skillsWrap}>
            {drive.skillsRequired.map((skill, idx) => (
              <View key={idx} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attachment Card */}
        {drive.attachmentName && (
          <View style={[styles.sectionCard, SHADOWS.card]}>
            <Text style={styles.cardHeader}>Official Drive Documents</Text>
            <View style={styles.attachmentBox}>
              <FileText size={22} color={COLORS.primaryAccent} />
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {drive.attachmentName}
                </Text>
                <Text style={styles.attachmentSize}>{drive.attachmentSize}</Text>
              </View>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => Alert.alert('Download', 'Downloading official company brochure...')}
              >
                <Download size={16} color={COLORS.primaryAccent} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Apply Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarLabel}>Application Status</Text>
          <Text style={styles.bottomBarValue}>
            {isApplied ? 'Application Active' : isEligible ? 'Eligible to Apply' : 'Ineligible'}
          </Text>
        </View>

        {isApplied ? (
          <View style={styles.appliedBtn}>
            <CheckCircle2 size={16} color={COLORS.textInverse} />
            <Text style={styles.appliedBtnText}>Applied</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.applyBtn,
              !isEligible && styles.applyBtnDisabled,
            ]}
            onPress={handleApply}
            disabled={applying}
            activeOpacity={0.8}
          >
            {applying ? (
              <ActivityIndicator color={COLORS.textInverse} size="small" />
            ) : (
              <Text style={styles.applyBtnText}>
                {isEligible ? 'Apply via CCPD' : 'Ineligible'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Eligibility Modal */}
      <EligibilityModal
        visible={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        drive={drive}
        student={student}
      />
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
  },
  companyMeta: {
    flex: 1,
  },
  companyName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  category: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  roleTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  metaChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  deadlineText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dangerDark,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  ctcHighlightBox: {
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  ctcHighlightLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctcHighlightValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryAccent,
    marginTop: 2,
  },
  salaryGrid: {
    gap: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  salaryRowLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  salaryRowValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  eligibilityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  checkPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryAccent,
  },
  eligibilityStatusBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  eligibilityStatusTitle: {
    ...TYPOGRAPHY.bodyBold,
    marginBottom: 2,
  },
  eligibilityStatusDesc: {
    ...TYPOGRAPHY.caption,
  },
  sectionDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  roundItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  roundNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  roundNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryAccent,
  },
  roundContent: {
    flex: 1,
  },
  roundName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  roundDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '600',
    marginTop: 1,
  },
  roundDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bodyText: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
  },
  subHeader: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: SPACING.xs,
  },
  bulletDot: {
    fontSize: 16,
    color: COLORS.primaryAccent,
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  attachmentSize: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  downloadBtn: {
    padding: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.cardHover,
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomBarLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  bottomBarValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minWidth: 140,
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  applyBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
  },
  appliedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  appliedBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
  },
});
