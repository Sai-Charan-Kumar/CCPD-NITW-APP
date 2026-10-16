import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  Calendar,
  Video,
  Award,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { StatusBadge } from '../components/StatusBadge';
import { TimelineStepper } from '../components/TimelineStepper';
import { placementService } from '../data/placementService';
import { Application, RootStackParamList } from '../types';

type ApplicationDetailRouteProp = RouteProp<RootStackParamList, 'ApplicationDetail'>;

export const ApplicationDetailScreen: React.FC = () => {
  const route = useRoute<ApplicationDetailRouteProp>();
  const { applicationId } = route.params;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApp() {
      try {
        setLoading(true);
        const data = await placementService.getApplicationById(applicationId);
        setApplication(data || null);
      } catch (err) {
        console.error('Failed to load application detail', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [applicationId]);

  if (loading || !application) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isOffer =
    application.status === 'Offer Extended' || application.status === 'Offer Accepted';

  // Find next scheduled round if any
  const scheduledRound = application.timeline.find((t) => t.status === 'scheduled');

  const handleOpenLink = (url?: string) => {
    if (url && url.startsWith('http')) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open interview meeting link.');
      });
    } else {
      Alert.alert('Interview Venue', url || 'Check CCPD Notice Board');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner Card */}
      <View style={[styles.headerCard, SHADOWS.card]}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.logoBox,
              { backgroundColor: isOffer ? COLORS.successLight : `${application.accentColor}18` },
            ]}
          >
            {isOffer ? (
              <Award size={24} color={COLORS.successDark} />
            ) : (
              <Text style={[styles.logoText, { color: application.accentColor }]}>
                {application.companyName.slice(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.companyMeta}>
            <Text style={styles.companyName}>{application.companyName}</Text>
            <Text style={styles.appliedDate}>Applied on {application.appliedDate}</Text>
          </View>
          <StatusBadge type="applicationStatus" value={application.status} />
        </View>

        <Text style={styles.roleTitle}>{application.role}</Text>

        <View style={styles.ctcBox}>
          <Text style={styles.ctcLabel}>Package Offered / CTC</Text>
          <Text style={styles.ctcValue}>{application.salaryDisplay}</Text>
        </View>
      </View>

      {/* Offer Congratulatory Card if Offer Extended */}
      {isOffer && (
        <View style={[styles.offerCard, SHADOWS.card]}>
          <View style={styles.offerCardHeader}>
            <Award size={20} color={COLORS.successDark} />
            <Text style={styles.offerCardTitle}>Offer Extended by {application.companyName}!</Text>
          </View>
          <Text style={styles.offerCardDesc}>
            Congratulations! The company has extended a formal employment offer. Please contact the CCPD office to submit Form C and collect your letter of intent.
          </Text>
        </View>
      )}

      {/* Upcoming Scheduled Interview Callout */}
      {scheduledRound && (
        <View style={[styles.scheduledCard, SHADOWS.card]}>
          <View style={styles.scheduledHeader}>
            <Clock size={18} color={COLORS.primaryAccent} />
            <Text style={styles.scheduledTitle}>Action Required: Upcoming Interview</Text>
          </View>
          <Text style={styles.scheduledRoundName}>{scheduledRound.roundName}</Text>
          <Text style={styles.scheduledTime}>
            Date: {scheduledRound.date} {scheduledRound.time ? `• ${scheduledRound.time}` : ''}
          </Text>

          {scheduledRound.instructions && (
            <Text style={styles.scheduledInstructions}>
              {scheduledRound.instructions}
            </Text>
          )}

          {scheduledRound.locationOrLink && (
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => handleOpenLink(scheduledRound.locationOrLink)}
              activeOpacity={0.8}
            >
              {scheduledRound.locationOrLink.startsWith('http') ? (
                <>
                  <Video size={16} color={COLORS.textInverse} />
                  <Text style={styles.joinBtnText}>Join Virtual Interview</Text>
                  <ExternalLink size={14} color={COLORS.textInverse} />
                </>
              ) : (
                <Text style={styles.joinBtnText}>View Venue Details</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Recruitment Timeline Stepper */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <Text style={styles.sectionTitle}>Application Stage Tracker</Text>
        <Text style={styles.sectionSubtitle}>
          Real-time updates directly synchronized with the company recruiter and CCPD senate.
        </Text>

        <TimelineStepper timeline={application.timeline} />
      </View>

      {/* CCPD Help & Guidelines */}
      <View style={[styles.helpCard, SHADOWS.card]}>
        <View style={styles.helpHeader}>
          <ShieldCheck size={18} color={COLORS.textSecondary} />
          <Text style={styles.helpTitle}>CCPD Support & Rules</Text>
        </View>
        <Text style={styles.helpDesc}>
          Interviews must be attended in full formal dress with identity card. If you experience an emergency or slot conflict, immediately notify the faculty placement coordinator.
        </Text>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() =>
            Alert.alert(
              'CCPD Coordinator Contact',
              'Faculty In-Charge: Prof. K. Venkatesh\nPhone: +91 870 246 2000\nEmail: ccpd@nitw.ac.in\nRoom: CCPD Admin Block Room 102'
            )
          }
        >
          <MessageSquare size={15} color={COLORS.primaryAccent} />
          <Text style={styles.contactBtnText}>Contact Placement Coordinator</Text>
        </TouchableOpacity>
      </View>
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
  headerCard: {
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
    marginBottom: SPACING.md,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
  },
  companyMeta: {
    flex: 1,
  },
  companyName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  appliedDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  roleTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  ctcBox: {
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctcLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  ctcValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primaryAccent,
  },
  offerCard: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.successBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  offerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  offerCardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.successDark,
  },
  offerCardDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.successDark,
    lineHeight: 18,
  },
  scheduledCard: {
    backgroundColor: COLORS.primarySoft,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  scheduledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  scheduledTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduledRoundName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  scheduledTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryAccent,
    fontWeight: '600',
    marginBottom: 8,
  },
  scheduledInstructions: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  joinBtn: {
    backgroundColor: COLORS.primaryAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  joinBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
    fontSize: 13,
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
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  helpCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  helpTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  helpDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  contactBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryAccent,
    fontSize: 12,
  },
});
