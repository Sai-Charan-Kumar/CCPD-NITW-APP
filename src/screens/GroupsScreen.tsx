import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../constants/theme';
import { placementService } from '../data/placementService';
import { PlacementGroup, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [groups, setGroups] = useState<PlacementGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    placementService.getMyGroups()
      .then(setGroups)
      .catch((error) => console.error('Failed to load placement groups', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Placement Groups</Text>
          <Text style={styles.subtitle}>Groups assigned by TNP coordinators will appear here.</Text>
        </View>
        {loading && <ActivityIndicator size="large" color={COLORS.primaryAccent} />}
        {!loading && groups.map((group) => (
          <Pressable
            key={group.id}
            style={styles.groupCard}
            onPress={() => navigation.navigate('GroupChat', { groupId: group.groupId, companyName: group.companyName })}
          >
            <View style={styles.icon}><Users size={21} color={COLORS.primaryAccent} /></View>
            <View style={styles.groupDetails}>
              <Text style={styles.groupTitle}>{group.companyName}</Text>
              <Text style={styles.groupRole}>{group.role}</Text>
              <Text style={styles.groupMeta}>{group.memberCount} member{group.memberCount === 1 ? '' : 's'} · {group.currentPhase}</Text>
            </View>
          </Pressable>
        ))}
        {!loading && groups.length === 0 && <View style={styles.emptyCard}>
          <View style={styles.icon}><Users size={21} color={COLORS.textMuted} /></View>
          <Text style={styles.emptyTitle}>No groups assigned</Text>
          <Text style={styles.emptyText}>You will see company-specific placement groups here when you are added to one.</Text>
        </View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: TAB_BAR_RESERVED_HEIGHT },
  header: { marginBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs },
  icon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  emptyCard: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xxl, borderWidth: 1, borderColor: COLORS.border },
  groupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  groupDetails: { flex: 1 },
  groupTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  groupRole: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
  groupMeta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: SPACING.xs },
  emptyTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginTop: SPACING.md },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs },
});
