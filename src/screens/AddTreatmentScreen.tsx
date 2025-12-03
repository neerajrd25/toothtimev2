import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import db from '../services/db';
import { NavigationStackParamList } from '../types';
import theme, { makeStyles } from '../theme';

type Props = {
  navigation: StackNavigationProp<NavigationStackParamList, 'AddTreatment'>;
  route: RouteProp<NavigationStackParamList, 'AddTreatment'>;
};

const TREATMENT_TYPES = [
  'Root Canal',
  'Implants',
  'Teeth Whitening',
  'Dental Crown',
  'Dental Bridge',
  'Tooth Extraction',
  'Dental Filling',
  'Orthodontics (Braces)',
  'Dental Veneers',
  'Gum Treatment',
  'Wisdom Tooth Removal',
  'Dental Cleaning',
  'Other',
];

const AddTreatmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId } = route.params;
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const styles = localStyles;

  const handleSave = async () => {
    if (!selectedTreatment.trim()) {
      Alert.alert('Validation', 'Please select a treatment type');
      return;
    }
    if (!cost.trim() || isNaN(Number(cost))) {
      Alert.alert('Validation', 'Please enter a valid cost');
      return;
    }

    const treatment = {
      id: 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      patient_id: patientId,
      treatment_type: selectedTreatment,
      description: description.trim() || null,
      status: 'active' as const,
      start_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      end_date: null,
      total_cost: parseFloat(cost),
      notes: notes.trim() || null,
    };

    const ok = await db.createTreatment(treatment);
    if (ok) {
      Alert.alert('Success', 'Treatment added successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to add treatment');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.inner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Treatment</Text>
        </View>

        <ScrollView style={styles.form}>
          <Text style={styles.label}>Treatment Type *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={selectedTreatment ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedTreatment || 'Select treatment type'}
            </Text>
            <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
                {TREATMENT_TYPES.map((treatment) => (
                  <TouchableOpacity
                    key={treatment}
                    style={[
                      styles.dropdownItem,
                      selectedTreatment === treatment && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedTreatment(treatment);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedTreatment === treatment && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {treatment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>Cost (₹) *</Text>
          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            placeholder="Enter treatment cost"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Treatment description (optional)"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes (optional)"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={theme.common.buttonPrimary} onPress={handleSave}>
            <Text style={theme.common.buttonPrimaryText}>Add Treatment</Text>
          </TouchableOpacity>
        </ScrollView>
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
  backButton: {
    fontSize: typography.body,
    color: colors.primary,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  input: {
    ...theme.common.input,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    ...theme.common.input,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.text,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: spacing.sm,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
}));

export default AddTreatmentScreen;
