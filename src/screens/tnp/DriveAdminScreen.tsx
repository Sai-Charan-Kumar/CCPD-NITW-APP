import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDown, FileSpreadsheet, Mail, Upload } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';
import { DrivePhase, PlacementDrive, RootStackParamList } from '../../types';

const PHASES: DrivePhase[] = ['OA', 'Interview', 'Final Selects'];
type AdminRoute = RouteProp<RootStackParamList, 'DriveAdmin'>;

export const DriveAdminScreen: React.FC = () => {
  const { params } = useRoute<AdminRoute>();
  const navigation = useNavigation();
  const [drive, setDrive] = useState<PlacementDrive>();
  const [phase, setPhase] = useState<DrivePhase>('OA');
  const [fileName, setFileName] = useState('');
  const [showPhases, setShowPhases] = useState(false);
  const [saving, setSaving] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendEmailAlso, setSendEmailAlso] = useState(false);
  const [identifiers, setIdentifiers] = useState('');
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    placementService.getDriveById(params.driveId).then((item) => {
      setDrive(item);
      if (item?.adminPhase) setPhase(item.adminPhase);
    });
  }, [params.driveId]);

  const selectFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets[0]) {
      setFileName(result.assets[0].name);
      setCsvContent(await fetch(result.assets[0].uri).then((response) => response.text()));
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      const result = await placementService.updateDriveAdmin(params.driveId, phase, fileName || undefined);
      let shortlistMessage = '';
      const manualIdentifiers = identifiers.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
      if (manualIdentifiers.length || csvContent) {
        const shortlist = await placementService.publishShortlist(
          params.driveId, manualIdentifiers, csvContent, broadcastMessage
        );
        shortlistMessage = ` ${shortlist.shortlistedCount} students shortlisted.`;
      }
      Alert.alert(result.success ? 'Drive updated' : 'Update failed', `${result.message}${shortlistMessage}`);
      if (result.success) navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (!drive) return <View style={styles.center}><Text style={styles.muted}>Loading drive...</Text></View>;
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.company}>{drive.companyName}</Text>
      <Text style={styles.role}>{drive.role} · {drive.appliedCount} applicants</Text>
      <Text style={styles.label}>Current phase</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowPhases((visible) => !visible)}>
        <Text style={styles.dropdownText}>{phase}</Text><ChevronDown size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      {showPhases && <View style={styles.menu}>{PHASES.map((item) => <TouchableOpacity key={item} style={styles.menuItem} onPress={() => { setPhase(item); setShowPhases(false); }}><Text style={styles.menuText}>{item}</Text></TouchableOpacity>)}</View>}
      <View style={styles.uploadCard}>
        <FileSpreadsheet size={24} color={COLORS.primaryAccent} />
        <Text style={styles.uploadTitle}>Upload Shortlisted Students</Text>
        <Text style={styles.helper}>Upload the company&apos;s shortlist. Unlisted students will be automatically removed from the applicant group.</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={selectFile}>
          <Upload size={17} color={COLORS.primaryAccent} /><Text style={styles.uploadButtonText}>Select Excel/CSV File</Text>
        </TouchableOpacity>
        {!!fileName && <Text style={styles.fileName}>{fileName}</Text>}
        <TextInput
          style={styles.textArea}
          value={identifiers}
          onChangeText={setIdentifiers}
          placeholder="Or enter emails / roll numbers separated by commas"
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.primaryAccent}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.broadcastCard}>
        <Text style={styles.label}>Text Broadcast (Optional)</Text>
        <TextInput
          style={styles.textArea}
          value={broadcastMessage}
          onChangeText={setBroadcastMessage}
          placeholder="Share a general update with this applicant group"
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.primaryAccent}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabelRow}>
            <Mail size={16} color={COLORS.primaryAccent} />
            <Text style={styles.toggleText}>Send notice via Email also</Text>
          </View>
          <Switch
            value={sendEmailAlso}
            onValueChange={setSendEmailAlso}
            trackColor={{ false: COLORS.border, true: COLORS.primaryAccent }}
            thumbColor={Platform.OS === 'android' ? COLORS.surface : undefined}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.submit} onPress={submit} disabled={saving}>
        <Text style={styles.submitText}>{saving ? 'Updating...' : 'Update Drive & Filter Group'}</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  scrollContent: { paddingBottom: SPACING.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  company: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  role: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.xs },
  label: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, marginTop: SPACING.xl, marginBottom: SPACING.xs },
  dropdown: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between' },
  dropdownText: { ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  menu: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginTop: 4 },
  menuItem: { padding: SPACING.md },
  menuText: { ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  uploadCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', padding: SPACING.lg, marginTop: SPACING.xl, alignItems: 'center' },
  broadcastCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.lg },
  textArea: { minHeight: 92, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
  toggleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  toggleText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary },
  uploadTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, marginTop: SPACING.sm },
  helper: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.primaryAccent, borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.md },
  uploadButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryAccent },
  fileName: { ...TYPOGRAPHY.bodySmall, color: COLORS.success, marginTop: SPACING.sm },
  submit: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  submitText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textInverse },
});
