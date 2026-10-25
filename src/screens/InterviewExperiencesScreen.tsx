import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { placementService } from '../data/placementService';
import { InterviewExperience } from '../types';

export const InterviewExperiencesScreen: React.FC = () => {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        setLoading(true);
        const data = await placementService.getInterviewExperiences();
        setExperiences(data);
      } catch (err) {
        console.error('Failed to load interview experiences', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

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
      <View style={styles.introBox}>
        <BookOpen size={20} color={COLORS.teal} />
        <View style={styles.introTextColumn}>
          <Text style={styles.introTitle}>Senior Interview Archives</Text>
          <Text style={styles.introSubtitle}>
            Verified technical question archives and preparation roadmaps contributed by NITW alumni.
          </Text>
        </View>
      </View>

      {experiences.map((exp) => (
        <View key={exp.id} style={[styles.experienceCard, SHADOWS.card]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.companyRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoInitials}>
                  {exp.companyName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{exp.companyName}</Text>
                <Text style={styles.roleName}>{exp.role}</Text>
              </View>
            </View>

            <View style={styles.verdictBadge}>
              <CheckCircle size={12} color={COLORS.successDark} />
              <Text style={styles.verdictText}>{exp.verdict}</Text>
            </View>
          </View>

          {/* Student Info & Meta */}
          <View style={styles.studentMetaRow}>
            <Text style={styles.studentName}>
              By {exp.studentName} ({exp.batch} • {exp.department.split('&')[0].trim()})
            </Text>
            <Text style={styles.packageOffered}>{exp.packageOffered}</Text>
          </View>

          <View style={styles.divider} />

          {/* Rounds Breakdown */}
          <Text style={styles.roundsSectionTitle}>Recruitment Rounds & Questions</Text>
          {exp.rounds.map((round, rIdx) => (
            <View key={rIdx} style={styles.roundItem}>
              <View style={styles.roundHeaderRow}>
                <Text style={styles.roundTitle}>{round.title}</Text>
                <View style={styles.durationPill}>
                  <Clock size={11} color={COLORS.textMuted} />
                  <Text style={styles.durationText}>{round.duration}</Text>
                </View>
              </View>

              <Text style={styles.questionsLabel}>Questions Asked:</Text>
              {round.questionsAsked.map((q, qIdx) => (
                <View key={qIdx} style={styles.questionBullet}>
                  <Text style={styles.questionDot}>Q{qIdx + 1}.</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}

              <View style={styles.tipBox}>
                <Sparkles size={13} color={COLORS.primaryAccent} />
                <Text style={styles.tipText}>
                  <Text style={{ fontWeight: '700' }}>Senior Tip: </Text>
                  {round.tipsAndStrategy}
                </Text>
              </View>
            </View>
          ))}

          {/* Overall Advice */}
          <View style={styles.overallAdviceBox}>
            <Text style={styles.overallAdviceLabel}>Overall Candidate Advice</Text>
            <Text style={styles.overallAdviceText}>{exp.overallAdvice}</Text>
          </View>
        </View>
      ))}
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
  introBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.tealLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: SPACING.lg,
    gap: 12,
    alignItems: 'center',
  },
  introTextColumn: {
    flex: 1,
  },
  introTitle: {
    ...TYPOGRAPHY.h4,
    color: '#0F766E',
  },
  introSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#115E59',
    marginTop: 2,
    lineHeight: 16,
  },
  experienceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
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
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  logoInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryAccent,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  roleName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  verdictBadge: {
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
  verdictText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  studentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  studentName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  packageOffered: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryAccent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  roundsSectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  roundItem: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roundHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  roundTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  questionsLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  questionBullet: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  questionDot: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryAccent,
    marginRight: 6,
  },
  questionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    gap: 6,
    alignItems: 'flex-start',
  },
  tipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  overallAdviceBox: {
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryAccent,
  },
  overallAdviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  overallAdviceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});
