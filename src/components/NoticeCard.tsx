import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, FileText, Pin, ChevronRight } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Notice } from '../types';

interface NoticeCardProps {
  notice: Notice;
  onPress: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onPress }) => {
  const isUrgent = notice.priority === 'high';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        SHADOWS.card,
        isUrgent && styles.urgentBorder,
        !notice.isRead && styles.unreadBg,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Metadata Row */}
      <View style={styles.topRow}>
        <View style={styles.categoryRow}>
          {notice.isPinned && (
            <View style={styles.pinBadge}>
              <Pin size={11} color={COLORS.primaryAccent} />
              <Text style={styles.pinText}>Pinned</Text>
            </View>
          )}

          {isUrgent ? (
            <View style={styles.urgentBadge}>
              <AlertCircle size={11} color={COLORS.danger} />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          ) : (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{notice.category}</Text>
            </View>
          )}

          {!notice.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.dateText}>{notice.publishedAt}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, !notice.isRead && styles.boldTitle]} numberOfLines={2}>
        {notice.title}
      </Text>

      {/* Summary Snippet */}
      <Text style={styles.summary} numberOfLines={2}>
        {notice.summary}
      </Text>

      {/* Footer: Author & Attachment */}
      <View style={styles.footerRow}>
        <Text style={styles.author} numberOfLines={1}>
          By {notice.author} ({notice.authorRole})
        </Text>

        <View style={styles.footerRight}>
          {notice.attachments && notice.attachments.length > 0 && (
            <View style={styles.attachmentPill}>
              <FileText size={12} color={COLORS.primaryAccent} />
              <Text style={styles.attachmentText}>
                {notice.attachments.length} {notice.attachments.length === 1 ? 'file' : 'files'}
              </Text>
            </View>
          )}
          <ChevronRight size={16} color={COLORS.textMuted} />
        </View>
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
  urgentBorder: {
    borderColor: COLORS.dangerBorder,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  unreadBg: {
    backgroundColor: '#FAF5FF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  pinText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryAccent,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    gap: 3,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.dangerDark,
  },
  categoryBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryAccent,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  boldTitle: {
    fontWeight: '700',
    color: '#1E1B4B',
  },
  summary: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  author: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: SPACING.sm,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  attachmentText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryAccent,
  },
});
