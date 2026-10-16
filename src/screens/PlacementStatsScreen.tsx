import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  Award,
  Users,
  Building2,
  PieChart,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { StatCard } from '../components/StatCard';
import { placementService } from '../data/placementService';
import { PlacementStatistics } from '../types';

export const PlacementStatsScreen: React.FC = () => {
  const [stats, setStats] = useState<PlacementStatistics | null>(null);
  const [loading, setLoading] = useState(true);

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
      {/* Hero Stats Header */}
      <View style={[styles.heroCard, SHADOWS.card]}>
        <Text style={styles.heroYear}>Campus Placements {stats.academicYear}</Text>
        <Text style={styles.heroTitle}>Batch Placement Record</Text>
        <Text style={styles.heroSubtitle}>
          {stats.totalOffers} Total Offers extended across {stats.totalStudentsEligible} eligible students ({stats.placementPercentage}% overall placed)
        </Text>

        <View style={styles.heroPillsRow}>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillValue}>{stats.highestPackage}</Text>
            <Text style={styles.heroPillLabel}>Highest Package</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillValue}>{stats.averagePackage}</Text>
            <Text style={styles.heroPillLabel}>Average CTC</Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillValue}>{stats.medianPackage}</Text>
            <Text style={styles.heroPillLabel}>Median CTC</Text>
          </View>
        </View>
      </View>


      {/* Top Hiring Partners Table */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <View style={styles.sectionHeaderRow}>
          <Building2 size={18} color={COLORS.primaryAccent} />
          <Text style={styles.sectionTitle}>Top Hiring Partners</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableColHeader, { flex: 2 }]}>Company</Text>
          <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Offers</Text>
          <Text style={[styles.tableColHeader, { flex: 1.5, textAlign: 'right' }]}>Highest</Text>
        </View>

        {stats.topRecruiters.map((recruiter, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tableCellBold, { flex: 2 }]} numberOfLines={1}>
              {recruiter.name}
            </Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
              {recruiter.offersCount}
            </Text>
            <Text style={[styles.tableCellAccent, { flex: 1.5, textAlign: 'right' }]}>
              {recruiter.highestPackage}
            </Text>
          </View>
        ))}
      </View>

      {/* Department-wise Placement Rates */}
      <View style={[styles.sectionCard, SHADOWS.card]}>
        <View style={styles.sectionHeaderRow}>
          <Users size={18} color={COLORS.teal} />
          <Text style={styles.sectionTitle}>Branch-Wise Performance</Text>
        </View>

        {stats.branchWiseStats.map((branchItem, idx) => (
          <View key={idx} style={styles.branchRow}>
            <View style={styles.branchHeader}>
              <Text style={styles.branchName} numberOfLines={1}>
                {branchItem.branch}
              </Text>
              <Text style={styles.branchPercent}>{branchItem.percentage}% Placed</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.branchBarTrack}>
              <View
                style={[
                  styles.branchBarFill,
                  { width: `${branchItem.percentage}%` },
                ]}
              />
            </View>

            <View style={styles.branchMeta}>
              <Text style={styles.branchMetaText}>Avg: {branchItem.averagePackage}</Text>
              <Text style={styles.branchMetaText}>Highest: {branchItem.highestPackage}</Text>
            </View>
          </View>
        ))}
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
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroYear: {
    ...TYPOGRAPHY.caption,
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textInverse,
    marginTop: 2,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: '#E0E7FF',
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  heroPillsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  heroPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  heroPillValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  heroPillLabel: {
    fontSize: 10,
    color: '#E0E7FF',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 4,
  },
  tableColHeader: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  tableCellBold: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  tableCell: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  tableCellAccent: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryAccent,
    fontSize: 13,
  },
  branchRow: {
    marginBottom: SPACING.md,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  branchName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    fontSize: 13,
    flex: 1,
    marginRight: SPACING.sm,
  },
  branchPercent: {
    ...TYPOGRAPHY.caption,
    color: COLORS.teal,
    fontWeight: '700',
  },
  branchBarTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  branchBarFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: RADIUS.full,
  },
  branchMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  branchMetaText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
