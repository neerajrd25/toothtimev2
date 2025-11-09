import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import db from '../services/db';
import { NavigationStackParamList } from '../types';
import theme, { makeStyles } from '../theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  navigation: StackNavigationProp<NavigationStackParamList, 'Dashboard'>;
};

const AddPatientScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [treatmentType, setTreatmentType] = useState<'Root Canal' | 'Implants' | ''>('');

  const styles = localStyles;
  
  // Format date as DD-MM-YYYY for display
  const formatDateDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  
  // Convert Date to YYYY-MM-DD for database storage
  const convertToDbFormat = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  // Handler for date picker change
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter patient name');
      return;
    }
    if (!treatmentType) {
      Alert.alert('Validation', 'Please select a treatment type');
      return;
    }

    const dbDate = convertToDbFormat(selectedDate);

    const patient = {
      id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
      first_visit_date: dbDate,
      treatment_type: treatmentType || null,
    };

    const ok = await db.createPatient(patient as any);
    if (ok) {
      Alert.alert('Success', 'Patient saved');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save patient');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Patient</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />

          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email (optional)" keyboardType="email-address" />

          <Text style={styles.label}>Notes</Text>
          <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Notes (optional)" multiline />

          <Text style={styles.label}>Date of first visit</Text>
          <TouchableOpacity
            style={styles.dateInputWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={[styles.input, { justifyContent: 'center' }]} pointerEvents="none">
              <Text style={{ fontSize: 16, color: '#333' }}>
                {formatDateDDMMYYYY(selectedDate)}
              </Text>
            </View>
            <View style={styles.dateIconWrapper} pointerEvents="none">
              <Ionicons name="calendar-outline" size={20} color="#999" />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Treatment Type</Text>
          <View style={styles.treatmentRow}>
            <TouchableOpacity
              style={[styles.treatmentBtn, treatmentType === 'Root Canal' && styles.treatmentBtnActive]}
              onPress={() => setTreatmentType('Root Canal')}
            >
              <Text style={[styles.treatmentBtnText, treatmentType === 'Root Canal' && styles.treatmentBtnTextActive]}>Root Canal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.treatmentBtn, treatmentType === 'Implants' && styles.treatmentBtnActive]}
              onPress={() => setTreatmentType('Implants')}
            >
              <Text style={[styles.treatmentBtnText, treatmentType === 'Implants' && styles.treatmentBtnTextActive]}>Implants</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={theme.common.buttonPrimary} onPress={handleSave}>
            <Text style={theme.common.buttonPrimaryText}>Save Patient</Text>
          </TouchableOpacity>
        </View>
        
        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const localStyles = makeStyles(({ colors, spacing, typography }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: colors.text,
  },
  form: {
    padding: spacing.md,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  input: {
    ...theme.common.input,
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInputWrapper: {
    position: 'relative',
  },
  dateIconWrapper: {
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  dateButtonText: {
    color: colors.text,
  },
  treatmentRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  treatmentBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  treatmentBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  treatmentBtnText: {
    color: colors.text,
    fontWeight: '600',
  },
  treatmentBtnTextActive: {
    color: colors.white,
  },
}));

export default AddPatientScreen;
