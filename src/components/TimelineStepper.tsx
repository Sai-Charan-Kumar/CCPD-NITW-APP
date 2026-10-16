import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock, AlertTriangle, Video, MapPin } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { ApplicationTimelineItem } from '../types';

interface TimelineStepperProps {
  timeline: ApplicationTimelineItem[];
}

export const TimelineStepper: React.FC<TimelineStepperProps> = ({ timeline }) => {
  return (
    <View style={styles.container}>
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const isPassed = item.status === 'passed';
        const isScheduled = item.status === 'scheduled';
        const isInProgress = item.status === 'in_progress';
        const isRejected = item.status === 'rejected';

        return (
          <View key={item.roundId || index} style={styles.stepRow}>
            {/* Left Node & Vertical Connector Line */}
            <View style={styles.nodeColumn}>
              <View
                style={[
                  styles.nodeCircle,
                  isPassed && styles.nodePassed,
                  (isScheduled || isInProgress) && styles.nodeCurrent,
                  isRejected && styles.nodeRejected,
                ]}
              >
                {isPassed && <Check size={14} color={COLORS.textInverse} />}
                {(isScheduled || isInProgress) && <Clock size={14} color={COLORS.textInverse} />}
                {isRejected && <AlertTriangle size={14} color={COLORS.textInverse} />}
                {!isPassed && !isScheduled && !isInProgress && !isRejected && (
                  <View style={styles.nodePendingInner} />
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    isPassed && styles.connectorPassed,
                  ]}
                />
              )}
            </View>

            {/* Right Content Card */}
            <View style={styles.contentColumn}>
              <View style={styles.headerRow}>
                <Text style={styles.roundTitle}>{item.roundName}</Text>
                <View
                  style={[
                    styles.statusPill,
                    isPassed && styles.statusPassed,
                    (isScheduled || isInProgress) && styles.statusScheduled,
                    isRejected && styles.statusRejected,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isPassed && { color: COLORS.successDark },
                      (isScheduled || isInProgress) && { color: COLORS.primaryAccent },
                      isRejected && { color: COLORS.dangerDark },
                    ]}
                  >
                    {isPassed
                      ? 'Cleared'
                      : isScheduled
                      ? 'Scheduled'
                      : isInProgress
                      ? 'In Progress'
                      : isRejected
                      ? 'Not Cleared'
                      : 'Pending'}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>
                {item.date} {item.time ? `• ${item.time}` : ''}
              </Text>

              {item.locationOrLink && (
                <View style={styles.infoRow}>
                  {item.locationOrLink.startsWith('http') ? (
                    <Video size={13} color={COLORS.primaryAccent} />
                  ) : (
                    <MapPin size={13} color={COLORS.textSecondary} />
                  )}
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.locationOrLink}
                  </Text>
                </View>
              )}

              {item.feedback && (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackLabel}>CCPD Feedback:</Text>
                  <Text style={styles.feedbackText}>{item.feedback}</Text>
                </View>
              )}

              {item.instructions && (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsLabel}>Candidate Instructions:</Text>
                  <Text style={styles.instructionsText}>{item.instructions}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: SPACING.md,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodePassed: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.successDark,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primaryAccent,
    borderColor: COLORS.primaryLight,
  },
  nodeRejected: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.dangerDark,
  },
  nodePendingInner: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textMuted,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: -2,
    marginBottom: -6,
  },
  connectorPassed: {
    backgroundColor: COLORS.success,
  },
  contentColumn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roundTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
  },
  statusPassed: {
    backgroundColor: COLORS.successLight,
  },
  statusScheduled: {
    backgroundColor: COLORS.primarySoft,
  },
  statusRejected: {
    backgroundColor: COLORS.dangerLight,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  feedbackBox: {
    backgroundColor: COLORS.successLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  feedbackLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.successDark,
    marginBottom: 2,
  },
  feedbackText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
  instructionsBox: {
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryAccent,
  },
  instructionsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  instructionsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
});
