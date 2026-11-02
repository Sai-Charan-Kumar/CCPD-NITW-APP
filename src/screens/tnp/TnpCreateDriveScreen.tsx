import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarClock, Plus, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';
import { getApiErrorMessage } from '../../api/axiosClient';
import { Department, PlacementDrive, RootStackParamList } from '../../types';

const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Metallurgical & Materials Engineering',
  'Biotechnology',
];
type CreateDriveRoute = RouteProp<RootStackParamList, 'CreateDrive'>;

export const TnpCreateDriveScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CreateDriveRoute>();
  const driveId = route.params?.driveId;
  const editing = Boolean(driveId);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [description, setDescription] = useState('');
  const [minCgpa, setMinCgpa] = useState('0');
  const [allowedDepartments, setAllowedDepartments] = useState<Department[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [documentInput, setDocumentInput] = useState('');

  useEffect(() => {
    if (!driveId) return;
    void placementService.getDriveById(driveId).then((drive) => {
      if (!drive) {
        Alert.alert('Drive unavailable', 'This drive could not be loaded.');
        navigation.goBack();
        return;
      }
      setFormFromDrive(drive);
    });
  }, [driveId]);

  const setFormFromDrive = (drive: PlacementDrive) => {
    setCompanyName(drive.companyName);
    setRole(drive.role);
    setCtc(drive.salary.ctcDisplay);
    setDeadline(new Date(drive.registrationDeadline));
    setDescription(drive.description);
    setRequiredDocs(drive.requiredExtraDocs || []);
    setMinCgpa(String(drive.eligibility.minCgpa || 0));
    setAllowedDepartments(drive.eligibility.allowedDepartments || []);
  };

  const addDocument = () => {
    const document = documentInput.trim();
    if (!document || requiredDocs.includes(document)) return;
    if (!/\.pdf$/i.test(document)) {
      Alert.alert('PDF required', 'Extra document requirements must end with .pdf, for example: government-id.pdf');
      return;
    }
    setRequiredDocs((current) => [...current, document]);
    setDocumentInput('');
  };

  const removeDocument = (document: string) =>
    setRequiredDocs((current) => current.filter((item) => item !== document));

  const createDrive = async () => {
    if (!companyName.trim() || !role.trim() || !ctc.trim() || !deadline || !description.trim()) {
      Alert.alert('Incomplete drive', 'Company, role, CTC, deadline, and company description are required.');
      return;
    }
    if (deadline <= new Date()) {
      Alert.alert('Invalid deadline', 'The application deadline must be in the future.');
      return;
    }
    setSaving(true);
    try {
      const input = {
        companyName: companyName.trim(),
        role: role.trim(),
        ctc: ctc.trim(),
        registrationDeadline: deadline.toISOString(),
        description: description.trim(),
        requiredExtraDocs: requiredDocs,
        eligibility: {
          minCgpa: Number(minCgpa),
          allowedDepartments,
        },
      };
      if (driveId) {
        await placementService.updateDrive(driveId, input);
      } else {
        await placementService.createDrive(input);
      }
      Alert.alert(editing ? 'Drive updated' : 'Drive created', editing
        ? 'The drive details and eligibility criteria were updated.'
        : 'The new drive is now available to students.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Could not create drive',
        getApiErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleDepartment = (department: Department) => {
    setAllowedDepartments((current) =>
      current.includes(department)
        ? current.filter((item) => item !== department)
        : [...current, department]
    );
  };

  const openDeadlinePicker = () => {
    setPickerMode('date');
    setPickerVisible(true);
  };

  const handleDeadlineChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    if (Platform.OS === 'ios') {
      setDeadline(selectedDate);
      return;
    }

    if (pickerMode === 'date') {
      const currentTime = deadline ?? new Date();
      const nextDate = new Date(selectedDate);
      nextDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
      setDeadline(nextDate);
      if (Platform.OS === 'android') {
        setPickerMode('time');
        setPickerVisible(true);
      }
      return;
    }

    const nextDeadline = new Date(deadline ?? new Date());
    nextDeadline.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setDeadline(nextDeadline);
  };

  const deadlineLabel = deadline
    ? deadline.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Select application deadline';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Publish a campus drive and define the documents students must submit.</Text>
      {[
        ['Company Name', companyName, setCompanyName],
        ['Role', role, setRole],
        ['CTC', ctc, setCtc],
      ].map(([label, value, setter]) => (
        <View key={label as string}>
          <Text style={styles.label}>{label as string}</Text>
          <TextInput style={styles.input} value={value as string} onChangeText={setter as (text: string) => void} placeholder={label as string} placeholderTextColor={COLORS.textMuted} />
        </View>
      ))}
      <Text style={styles.label}>Application Deadline</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={openDeadlinePicker}
        accessibilityLabel="Select application deadline"
      >
        <CalendarClock size={20} color={COLORS.primaryAccent} />
        <Text style={[styles.dateText, !deadline && styles.placeholderText]}>{deadlineLabel}</Text>
      </TouchableOpacity>
      {pickerVisible && (
        <DateTimePicker
          value={deadline ?? new Date(Date.now() + 24 * 60 * 60 * 1000)}
          mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
          minimumDate={new Date()}
          onChange={handleDeadlineChange}
        />
      )}
      <Text style={styles.label}>Company / Role Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Add the complete description shown to students"
        placeholderTextColor={COLORS.textMuted}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.label}>Minimum CGPA</Text>
      <TextInput
        style={styles.input}
        value={minCgpa}
        onChangeText={setMinCgpa}
        placeholder="0 for no minimum"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="decimal-pad"
      />
      <Text style={styles.label}>Allowed Branches</Text>
      <Text style={styles.helper}>Leave all unselected to allow every branch.</Text>
      <View style={styles.departmentList}>
        {DEPARTMENTS.map((department) => {
          const selected = allowedDepartments.includes(department);
          return (
            <TouchableOpacity
              key={department}
              style={[styles.departmentChip, selected && styles.departmentChipSelected]}
              onPress={() => toggleDepartment(department)}
            >
              <Text style={[styles.departmentText, selected && styles.departmentTextSelected]}>
                {department}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.label}>Custom Document Requirements</Text>
      <View style={styles.documentInputRow}>
        <TextInput
          style={styles.documentInput}
          value={documentInput}
          onChangeText={setDocumentInput}
          onSubmitEditing={addDocument}
          placeholder="Enter a PDF filename like 'government-id.pdf'"
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addDocument} accessibilityLabel="Add document requirement">
          <Plus size={18} color={COLORS.textInverse} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chipList}>
        {requiredDocs.map((document) => (
          <View style={styles.chip} key={document}>
            <Text style={styles.chipText}>{document}</Text>
            <TouchableOpacity onPress={() => removeDocument(document)} accessibilityLabel={`Remove ${document}`}>
              <X size={15} color={COLORS.primaryAccent} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={createDrive} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Drive')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  label: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary },
  helper: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginBottom: SPACING.sm },
  departmentList: { gap: SPACING.sm },
  departmentChip: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md },
  departmentChipSelected: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primaryAccent },
  departmentText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  departmentTextSelected: { color: COLORS.primary, fontWeight: '700' },
  dateButton: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dateText: { ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  placeholderText: { color: COLORS.textMuted },
  descriptionInput: { minHeight: 140 },
  documentInputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  documentInput: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary },
  addButton: { backgroundColor: COLORS.primaryAccent, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  addButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textInverse },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.full, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  chipText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary },
  button: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  buttonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textInverse },
});
