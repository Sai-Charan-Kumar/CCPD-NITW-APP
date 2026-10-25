import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Briefcase, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../constants/theme';
import { SearchBar } from '../components/SearchBar';
import { DriveCard } from '../components/DriveCard';
import { EmptyState } from '../components/EmptyState';
import { placementService } from '../data/placementService';
import { PlacementDrive, StudentProfile, RootStackParamList, BottomTabParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DrivesRouteProp = RouteProp<BottomTabParamList, 'Drives'>;

const CATEGORIES = [
  'All',
  'Software Development',
  'Core Engineering',
  'Finance & Quant',
  'Product & Analytics',
];

export const DrivesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DrivesRouteProp>();

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [appliedDriveIds, setAppliedDriveIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params?.categoryFilter || 'All'
  );
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrives = useCallback(async () => {
    try {
      const studentData = await placementService.getStudentProfile();
      const fetchedDrives = await placementService.getDrives({
        query: searchQuery,
        category: selectedCategory,
        onlyEligible,
      });
      const applications = await placementService.getApplications();

      setStudent(studentData);
      setDrives(fetchedDrives);
      setAppliedDriveIds(new Set(applications.map((a) => a.driveId)));
    } catch (err) {
      console.error('Error fetching drives', err);
    }
  }, [searchQuery, selectedCategory, onlyEligible]);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void loadDrives();
    }, 0);
    return () => clearTimeout(loadTimer);
  }, [loadDrives]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrives();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Search & Filters */}
      <View style={styles.filterSection}>
        <SearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          placeholder="Search company, role, or skill..."
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Quick Filters Row */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.togglePill,
              onlyEligible && styles.togglePillActive,
            ]}
            onPress={() => setOnlyEligible((prev) => !prev)}
            activeOpacity={0.7}
          >
            <CheckCircle2
              size={14}
              color={onlyEligible ? COLORS.successDark : COLORS.textMuted}
            />
            <Text
              style={[
                styles.toggleText,
                onlyEligible && styles.toggleTextActive,
              ]}
            >
              Eligible Only
            </Text>
          </TouchableOpacity>

          <Text style={styles.countText}>
            Showing {drives.length} {drives.length === 1 ? 'drive' : 'drives'}
          </Text>
        </View>
      </View>

      {/* Drives List */}
      <FlatList
        data={drives}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        renderItem={({ item }) => {
          const isEligible = student
            ? placementService.checkEligibility(student, item).isEligible
            : false;
          const isApplied = appliedDriveIds.has(item.id);

          return (
            <DriveCard
              drive={item}
              isEligible={isEligible}
              isApplied={isApplied}
              onPress={() => navigation.navigate('JobDetail', { driveId: item.id })}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={<Briefcase size={32} color={COLORS.textMuted} />}
            title="No Drives Found"
            description="Try adjusting your search query, department, or clearing eligibility filters."
            actionLabel="Reset Filters"
            onPressAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyEligible(false);
            }}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    gap: 6,
  },
  togglePillActive: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.successBorder,
  },
  toggleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.successDark,
    fontWeight: '700',
  },
  countText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_RESERVED_HEIGHT,
  },
});
