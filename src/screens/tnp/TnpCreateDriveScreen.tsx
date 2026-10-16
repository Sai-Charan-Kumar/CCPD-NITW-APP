import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { placementService } from '../../data/placementService';

export const TnpCreateDriveScreen: React.FC = () => {
  const navigation = useNavigation();
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [documentInput, setDocumentInput] = useState('');

  const addDocument = () => {
    const document = documentInput.trim();
    if (!document || requiredDocs.includes(document)) return;
    setRequiredDocs((current) => [...current, document]);
    setDocumentInput('');
  };

  const removeDocument = (document: string) =>
    setRequiredDocs((current) => current.filter((item) => item !== document));

  const createDrive = async () => {
    if (!companyName.trim() || !role.trim() || !ctc.trim() || !deadline.trim()) {
      Alert.alert('Incomplete drive', 'Company, role, CTC, and deadline are required.');
      return;
    }
    setSaving(true);
    try {
      await placementService.createDrive({
        companyName: companyName.trim(),
        role: role.trim(),
        ctc: ctc.trim(),
        registrationDeadline: deadline.trim(),
        requiredExtraDocs: requiredDocs,
      });
      Alert.alert('Drive created', 'The new drive is now available to students.');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Publish a campus drive and define the documents students must submit.</Text>
      {[
        ['Company Name', companyName, setCompanyName],
        ['Role', role, setRole],
        ['CTC', ctc, setCtc],
        ['Application Deadline (ISO date)', deadline, setDeadline],
      ].map(([label, value, setter]) => (
        <View key={label as string}>
          <Text style={styles.label}>{label as string}</Text>
          <TextInput style={styles.input} value={value as string} onChangeText={setter as (text: string) => void} placeholder={label as string} placeholderTextColor={COLORS.textMuted} />
        </View>
      ))}
      <Text style={styles.label}>Custom Document Requirements</Text>
      <View style={styles.documentInputRow}>
        <TextInput
          style={styles.documentInput}
          value={documentInput}
          onChangeText={setDocumentInput}
          onSubmitEditing={addDocument}
          placeholder="Enter document name like 'Govt ID' or 'Portfolio'"
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
        <Text style={styles.buttonText}>{saving ? 'Creating...' : 'Create Drive'}</Text>
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
