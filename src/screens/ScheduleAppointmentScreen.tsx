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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import db from '../services/db';
import { NavigationStackParamList } from '../types';
import theme, { makeStyles } from '../theme';

type Props = {
  navigation: StackNavigationProp<NavigationStackParamList, 'ScheduleAppointment'>;
  route: RouteProp<NavigationStackParamList, 'ScheduleAppointment'>;
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

const ScheduleAppointmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId, treatmentId } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState(30);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [notes, setNotes] = useState('');

  const styles = localStyles;

  const formatDateDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const convertToDbFormat = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const sendSMSNotification = async (patientPhone: string, patientName: string, treatmentType: string) => {
    const formattedDate = formatDateDDMMYYYY(selectedDate);
    const message = `Dear ${patientName},\n\nYour appointment for ${treatmentType} has been scheduled.\n\nDate: ${formattedDate}\nTime: ${selectedTime}\nDuration: ${duration} minutes\n\nPlease arrive 10 minutes early.\n\nThank you,\nToothTime Dental Clinic`;

    const url = `sms:${patientPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open SMS app');
      }
    } catch (error) {
      console.error('SMS error:', error);
      Alert.alert('Error', 'Failed to open SMS app');
    }
  };

  const handleSave = async () => {
    if (!selectedTime) {
      Alert.alert('Validation', 'Please select an appointment time');
      return;
    }

    const appointment = {
      id: 'apt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      treatment_id: treatmentId,
      patient_id: patientId,
      appointment_date: convertToDbFormat(selectedDate),
      appointment_time: selectedTime,
      duration_minutes: duration,
      status: 'scheduled' as const,
      notes: notes.trim() || null,
    };

    const ok = await db.createAppointment(appointment);
    if (ok) {
      // Get patient and treatment details for SMS
      const patient = await db.getPatientById(patientId);
      const treatments = await db.getTreatmentsByPatient(patientId);
      const treatment = treatments.find(t => t.id === treatmentId);

      if (patient && patient.phone && treatment) {
        // Ask if user wants to send SMS notification
        Alert.alert(
          'Appointment Scheduled',
          'Would you like to send an SMS notification to the patient?',
          [
            {
              text: 'Skip',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Send SMS',
              onPress: () => {
                sendSMSNotification(patient.phone!, patient.name, treatment.treatment_type);
                navigation.goBack();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Success', 'Appointment scheduled successfully');
        navigation.goBack();
      }
    } else {
      Alert.alert('Error', 'Failed to schedule appointment');
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
          <Text style={styles.title}>Schedule Appointment</Text>
        </View>

        <ScrollView style={styles.form}>
          <Text style={styles.label}>Appointment Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {formatDateDDMMYYYY(selectedDate)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Appointment Time *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTimePicker(!showTimePicker)}
          >
            <Text style={selectedTime ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedTime ? `🕐 ${selectedTime}` : 'Select time slot'}
            </Text>
            <Text style={styles.dropdownArrow}>{showTimePicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.dropdownItem,
                      selectedTime === time && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedTime(time);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedTime === time && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>Duration (minutes) *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDurationPicker(!showDurationPicker)}
          >
            <Text style={styles.dropdownText}>
              ⏱️ {duration} minutes
            </Text>
            <Text style={styles.dropdownArrow}>{showDurationPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showDurationPicker && (
            <View style={styles.dropdownList}>
              {DURATION_OPTIONS.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.dropdownItem,
                    duration === dur && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setDuration(dur);
                    setShowDurationPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      duration === dur && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {dur} minutes
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
            <Text style={theme.common.buttonPrimaryText}>Schedule Appointment</Text>
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
  dateButton: {
    ...theme.common.input,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
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
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
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

export default ScheduleAppointmentScreen;
