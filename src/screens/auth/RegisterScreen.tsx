import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown, Check, UserPlus } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList, Department } from '../../types';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const BRANCHES: Department[] = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Metallurgical & Materials Engineering',
  'Biotechnology',
];

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState<Department>(BRANCHES[0]);
  const [cgpa, setCgpa] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !rollNumber.trim() || !email.trim() || !cgpa.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid student email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    const numCgpa = parseFloat(cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      setErrorMsg('Please enter a valid CGPA between 0.0 and 10.0');
      return;
    }

    setErrorMsg('');
    const result = await register({
      name: fullName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department,
      cgpa: numCgpa,
      email: email.trim(),
      password,
    });

    if (!result.success) {
      setErrorMsg(result.message || 'Registration failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <UserPlus size={28} color={COLORS.primaryAccent} />
          </View>
          <Text style={styles.title}>Student Registration</Text>
          <Text style={styles.subtitle}>
            Create your placement profile for campus recruitment season
          </Text>
        </View>

        <View style={[styles.card, SHADOWS.card]}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Roll Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CS22B089"
              placeholderTextColor={COLORS.textMuted}
              value={rollNumber}
              autoCapitalize="characters"
              onChangeText={(t) => {
                setRollNumber(t);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Branch Dropdown Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Engineering Branch *</Text>
            <TouchableOpacity
              style={styles.selectorBtn}
              onPress={() => setShowBranchModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectorBtnText} numberOfLines={1}>
                {department}
              </Text>
              <ChevronDown size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* CGPA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current CGPA * (Scale of 10.0)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 8.84"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              value={cgpa}
              onChangeText={(t) => {
                setCgpa(t);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. rahul_cs22@student.nitw.ac.in"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Create Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create account password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.textInverse} size="small" />
            ) : (
              <Text style={styles.registerBtnText}>Complete Registration</Text>
            )}
          </TouchableOpacity>

          {/* Already have account */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Already registered? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Branch Selection Modal */}
      <Modal visible={showBranchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <Text style={styles.modalTitle}>Select Department</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {BRANCHES.map((b) => {
                const isSelected = department === b;
                return (
                  <TouchableOpacity
                    key={b}
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      setDepartment(b);
                      setShowBranchModal(false);
                    }}
                  >
                    <Text
                      style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}
                    >
                      {b}
                    </Text>
                    {isSelected && <Check size={18} color={COLORS.primaryAccent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowBranchModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dangerDark,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  selectorBtnText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  registerBtn: {
    backgroundColor: COLORS.primaryAccent,
    borderRadius: RADIUS.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  registerBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textInverse,
    fontSize: 15,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  loginLinkText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  loginLinkBold: {
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  modalItemSelected: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  modalItemText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalItemTextSelected: {
    fontWeight: '700',
    color: COLORS.primaryAccent,
  },
  modalCloseBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalCloseBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});
