import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Users } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../constants/theme';
import { DrivePhase, PlacementGroup, RootStackParamList } from '../types';
import { placementService } from '../data/placementService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const phaseColor: Record<DrivePhase, string> = {
  OA: COLORS.primaryAccent,
  Interview: COLORS.purple,
  'Final Selects': COLORS.success,
};

export const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [groups, setGroups] = useState<PlacementGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setGroups(await placementService.getMyGroups());
      } catch (error) {
        console.error('Failed to load placement groups', error);
      } finally {
        setLoading(false);
      }
    };
    void loadGroups();
  }, []);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={groups}
      refreshing={loading}
      keyExtractor={(group) => group.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>My Placement Groups</Text>
          <Text style={styles.subtitle}>Text announcements and group updates from TnP coordinators.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GroupChat', { groupId: item.id, companyName: item.companyName })}
          activeOpacity={0.8}
        >
          <View style={styles.icon}><Users size={21} color={COLORS.primaryAccent} /></View>
          <View style={styles.details}>
            <Text style={styles.company}>{item.companyName}</Text>
            <Text style={styles.role}>{item.role}</Text>
            <View style={[styles.phaseBadge, { backgroundColor: `${phaseColor[item.currentPhase]}18` }]}>
              <Text style={[styles.phaseText, { color: phaseColor[item.currentPhase] }]}>Phase: {item.currentPhase}</Text>
            </View>
            <Text style={styles.members}>{item.memberCount} students</Text>
          </View>
          <ChevronRight size={19} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: TAB_BAR_RESERVED_HEIGHT },
  header: { marginBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  icon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  details: { flex: 1 },
  company: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  role: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
  phaseBadge: { alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3, marginTop: SPACING.sm },
  phaseText: { fontSize: 11, fontWeight: '700' },
  members: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
});
