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
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  AlertCircle,
  FileText,
  Download,
  Pin,
  Calendar,
  User,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { placementService } from '../data/placementService';
import { Notice, RootStackParamList } from '../types';

type NoticeDetailRouteProp = RouteProp<RootStackParamList, 'NoticeDetail'>;

export const NoticeDetailScreen: React.FC = () => {
  const route = useRoute<NoticeDetailRouteProp>();
  const { noticeId } = route.params;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotice() {
      try {
        setLoading(true);
        const data = await placementService.getNoticeById(noticeId);
        setNotice(data || null);
      } catch (err) {
        console.error('Failed to load notice detail', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotice();
  }, [noticeId]);

  if (loading || !notice) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isUrgent = notice.priority === 'high';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info Card */}
      <View style={[styles.headerCard, SHADOWS.card, isUrgent && styles.urgentBorder]}>
        <View style={styles.topBadgesRow}>
          {notice.isPinned && (
            <View style={styles.pinBadge}>
              <Pin size={11} color={COLORS.primaryAccent} />
              <Text style={styles.pinText}>Pinned Announcement</Text>
            </View>
          )}

          {isUrgent ? (
            <View style={styles.urgentBadge}>
              <AlertCircle size={11} color={COLORS.danger} />
              <Text style={styles.urgentText}>High Priority Alert</Text>
            </View>
          ) : (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{notice.category}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{notice.title}</Text>

        <View style={styles.authorMeta}>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <User size={16} color={COLORS.primary} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{notice.author}</Text>
              <Text style={styles.authorRole}>{notice.authorRole}</Text>
            </View>
          </View>
          <View style={styles.dateMeta}>
            <Calendar size={13} color={COLORS.textMuted} />
            <Text style={styles.dateText}>{notice.publishedAt}</Text>
          </View>
        </View>

        {/* Target Branches */}
        <View style={styles.branchesBox}>
          <Text style={styles.branchesLabel}>Target Audience:</Text>
          <View style={styles.branchesWrap}>
            {notice.targetBranches.map((branch, idx) => (
              <View key={idx} style={styles.branchPill}>
                <Text style={styles.branchPillText}>{branch}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Notice Body */}
      <View style={[styles.bodyCard, SHADOWS.card]}>
        <Text style={styles.bodyText}>{notice.body}</Text>
      </View>

      {/* Attachments Section */}
      {notice.attachments && notice.attachments.length > 0 && (
        <View style={[styles.attachmentsCard, SHADOWS.card]}>
          <Text style={styles.sectionHeader}>Attached Official Documents</Text>
          <Text style={styles.sectionDesc}>
            Verify all student shortlists and slot timings in the attached PDF files.
          </Text>

          {notice.attachments.map((att, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.attachmentItem}
              onPress={() =>
                Alert.alert('Download Started', `Downloading ${att.name} (${att.size})...`)
              }
              activeOpacity={0.7}
            >
              <View style={styles.pdfIconBox}>
                <FileText size={20} color={COLORS.danger} />
              </View>
              <View style={styles.attachmentMeta}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name}
                </Text>
                <Text style={styles.attachmentSize}>{att.size} • PDF Document</Text>
              </View>
              <View style={styles.downloadCircle}>
                <Download size={16} color={COLORS.primaryAccent} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  urgentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    borderColor: COLORS.dangerBorder,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
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
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
    marginBottom: SPACING.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  authorRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  dateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  branchesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  branchesLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  branchesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  branchPill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  branchPillText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bodyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  bodyText: {
    ...TYPOGRAPHY.body,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  attachmentsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pdfIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  attachmentMeta: {
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
  downloadCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
