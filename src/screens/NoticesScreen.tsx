import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, AlertCircle, Pin } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { NoticeCard } from '../components/NoticeCard';
import { EmptyState } from '../components/EmptyState';
import { placementService } from '../data/placementService';
import { Notice, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  'All',
  'Shortlist Published',
  'Schedule Update',
  'PPT & Orientation',
  'Policy & Guidelines',
  'Final Results',
];

export const NoticesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotices = useCallback(async () => {
    try {
      const data = await placementService.getNotices(selectedCategory);
      // Sort pinned first
      data.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices', err);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Category Pills Header */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notice List */}
      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        renderItem={({ item }) => (
          <NoticeCard
            notice={item}
            onPress={() => navigation.navigate('NoticeDetail', { noticeId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={32} color={COLORS.textMuted} />}
            title="No Notices Found"
            description="There are no announcements currently published under this category."
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
  categoriesSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
});
