import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Search, UserCheck, UserMinus, UserPlus, X } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TAB_BAR_RESERVED_HEIGHT, TYPOGRAPHY } from '../../constants/theme';
import { CoordinatorCandidate, placementService } from '../../data/placementService';

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export const TnpManagementScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<CoordinatorCandidate[]>([]);
  const [coordinators, setCoordinators] = useState<CoordinatorCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const loadRoster = useCallback(async () => {
    try {
      setLoadingRoster(true);
      setCoordinators(await placementService.getCoordinators());
    } catch (error) {
      Alert.alert('Unable to load coordinators', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  const search = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setCandidates([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    try {
      setCandidates(await placementService.searchCoordinatorCandidates(trimmed));
      setSearched(true);
    } catch (error) {
      Alert.alert('Search failed', error instanceof Error ? error.message : 'Unable to search students.');
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void loadRoster(), 0);
    return () => clearTimeout(timer);
  }, [loadRoster]);

  useEffect(() => {
    const timer = setTimeout(() => void search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  const promote = (candidate: CoordinatorCandidate) => {
    Alert.alert('Appoint TNP coordinator?', `${candidate.name} will receive placement-coordinator access.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Appoint',
        onPress: async () => {
          setBusyId(candidate.id);
          try {
            const appointed = await placementService.promoteStudentToCoordinator(candidate.id);
            setCandidates((current) => current.filter((item) => item.id !== candidate.id));
            setCoordinators((current) => [...current, appointed].sort((a, b) => a.name.localeCompare(b.name)));
            Alert.alert('Coordinator appointed', `${candidate.name} can now manage placement operations.`);
          } catch (error) {
            Alert.alert('Appointment failed', error instanceof Error ? error.message : 'Unable to appoint coordinator.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const remove = (coordinator: CoordinatorCandidate) => {
    Alert.alert('Remove TNP access?', `${coordinator.name} will return to a student account.`, [
      { text: 'Keep access', style: 'cancel' },
      {
        text: 'Remove access',
        style: 'destructive',
        onPress: async () => {
          setBusyId(coordinator.id);
          try {
            await placementService.demoteCoordinator(coordinator.id);
            setCoordinators((current) => current.filter((item) => item.id !== coordinator.id));
          } catch (error) {
            Alert.alert('Removal failed', error instanceof Error ? error.message : 'Unable to remove coordinator access.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.hero, SHADOWS.card]}>
        <View style={styles.heroIcon}><UserPlus size={22} color={COLORS.teal} /></View>
        <Text style={styles.heroTitle}>TNP coordinators</Text>
        <Text style={styles.heroText}>Appoint and manage student coordinators responsible for placement operations.</Text>
      </View>

      <View style={[styles.card, SHADOWS.card]}>
        <Text style={styles.cardTitle}>Appoint a coordinator</Text>
        <Text style={styles.cardSubtitle}>Search by name, email, or roll number.</Text>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search students"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><X size={17} color={COLORS.textMuted} /></TouchableOpacity>}
        </View>
        <Text style={styles.hint}>{searching ? 'Searching…' : 'Enter at least two characters.'}</Text>
        {searched && candidates.length === 0 && !searching && <Text style={styles.empty}>No students found.</Text>}
        {candidates.map((candidate) => (
          <View style={styles.personRow} key={candidate.id}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(candidate.name)}</Text></View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{candidate.name}</Text>
              <Text style={styles.personMeta}>{candidate.email}</Text>
              <Text style={styles.personMeta}>{candidate.rollNumber || 'Roll number not set'}</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => promote(candidate)} disabled={busyId !== null}>
              {busyId === candidate.id ? <ActivityIndicator color={COLORS.textInverse} size="small" /> : <Text style={styles.primaryButtonText}>Appoint</Text>}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={[styles.card, SHADOWS.card]}>
        <View style={styles.rosterHeader}>
          <View>
            <Text style={styles.cardTitle}>Active coordinators</Text>
            <Text style={styles.cardSubtitle}>{loadingRoster ? 'Loading…' : `${coordinators.length} appointed`}</Text>
          </View>
          <TouchableOpacity onPress={() => void loadRoster()} disabled={loadingRoster}><Text style={styles.refresh}>Refresh</Text></TouchableOpacity>
        </View>
        {coordinators.map((coordinator) => (
          <View style={styles.personRow} key={coordinator.id}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(coordinator.name)}</Text></View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{coordinator.name}</Text>
              <Text style={styles.personMeta}>{coordinator.email}</Text>
              <View style={styles.status}><UserCheck size={12} color={COLORS.successDark} /><Text style={styles.statusText}>TNP coordinator</Text></View>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => remove(coordinator)} disabled={busyId !== null} accessibilityLabel={`Remove ${coordinator.name}`}>
              <UserMinus size={16} color={COLORS.dangerDark} />
            </TouchableOpacity>
          </View>
        ))}
        {!loadingRoster && coordinators.length === 0 && <Text style={styles.empty}>No coordinators appointed yet.</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: TAB_BAR_RESERVED_HEIGHT },
  hero: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  heroIcon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.tealLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  heroTitle: { ...TYPOGRAPHY.h2, color: COLORS.textInverse },
  heroText: { ...TYPOGRAPHY.bodySmall, color: '#DDEAFE', marginTop: SPACING.xs },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  cardTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  cardSubtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 3 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, height: 48, borderWidth: 1, borderColor: COLORS.borderDark, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  hint: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: SPACING.xs, marginBottom: SPACING.sm },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.surfaceAlt, paddingVertical: SPACING.md },
  avatar: { width: 40, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft },
  avatarText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primaryAccent, fontWeight: '700' },
  personInfo: { flex: 1 },
  personName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  personMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  primaryButton: { backgroundColor: COLORS.primaryAccent, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, minWidth: 72, alignItems: 'center' },
  primaryButtonText: { ...TYPOGRAPHY.caption, color: COLORS.textInverse, fontWeight: '700' },
  rosterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  refresh: { ...TYPOGRAPHY.caption, color: COLORS.primaryAccent, fontWeight: '700' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusText: { ...TYPOGRAPHY.caption, color: COLORS.successDark, fontWeight: '700' },
  removeButton: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: COLORS.dangerBorder, alignItems: 'center', justifyContent: 'center' },
  empty: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, paddingVertical: SPACING.md },
});
