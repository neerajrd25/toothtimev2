import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import db from '../services/db';
import { NavigationStackParamList, Treatment, AppointmentRecord } from '../types';
import theme from '../theme';

type Props = {
  navigation: StackNavigationProp<NavigationStackParamList, 'PatientDetail'>;
  route: RouteProp<NavigationStackParamList, 'PatientDetail'>;
};

const PatientDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { patientId } = route.params;
  const [patient, setPatient] = useState<any>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatientData = async () => {
    try {
      const patientData = await db.getPatientById(patientId);
      const treatmentsData = await db.getTreatmentsByPatient(patientId);
      const appointmentsData = await db.getAppointmentsByPatient(patientId);
      
      setPatient(patientData);
      setTreatments(treatmentsData);
      setAppointments(appointmentsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPatientData();
    }, [patientId])
  );

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const handleAddTreatment = () => {
    navigation.navigate('AddTreatment', { patientId });
  };

  const handleScheduleAppointment = (treatmentId: string) => {
    navigation.navigate('ScheduleAppointment', { patientId, treatmentId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Patient not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Patient Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Patient Info Card */}
        <View style={styles.card}>
          <Text style={styles.patientName}>{patient.name}</Text>
          {patient.phone && <Text style={styles.contactInfo}>📱 {patient.phone}</Text>}
          {patient.email && <Text style={styles.contactInfo}>📧 {patient.email}</Text>}
          {patient.first_visit_date && (
            <Text style={styles.contactInfo}>
              🗓️ First Visit: {formatDate(patient.first_visit_date)}
            </Text>
          )}
          {patient.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{patient.notes}</Text>
            </View>
          )}
        </View>

        {/* Treatments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Treatments</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTreatment}>
              <Text style={styles.addButtonText}>+ Add Treatment</Text>
            </TouchableOpacity>
          </View>

          {treatments.length === 0 ? (
            <Text style={styles.emptyText}>No treatments yet</Text>
          ) : (
            treatments.map((treatment) => (
              <View key={treatment.id} style={styles.treatmentCard}>
                <View style={styles.treatmentHeader}>
                  <Text style={styles.treatmentType}>{treatment.treatment_type}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(treatment.status) }]}>
                    <Text style={styles.statusText}>{treatment.status}</Text>
                  </View>
                </View>
                {treatment.description && (
                  <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                )}
                {treatment.start_date && (
                  <Text style={styles.treatmentDate}>Start: {formatDate(treatment.start_date)}</Text>
                )}
                {treatment.total_cost && (
                  <Text style={styles.treatmentCost}>Cost: ₹{treatment.total_cost.toLocaleString()}</Text>
                )}
                
                <TouchableOpacity
                  style={styles.scheduleButton}
                  onPress={() => handleScheduleAppointment(treatment.id)}
                >
                  <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
                </TouchableOpacity>

                {/* Show appointments for this treatment */}
                {appointments.filter(apt => apt.treatment_id === treatment.id).length > 0 && (
                  <View style={styles.appointmentsSubSection}>
                    <Text style={styles.appointmentsSubTitle}>Appointments:</Text>
                    {appointments
                      .filter(apt => apt.treatment_id === treatment.id)
                      .map(apt => (
                        <View key={apt.id} style={styles.appointmentItem}>
                          <Text style={styles.appointmentText}>
                            {formatDate(apt.appointment_date)} at {apt.appointment_time}
                          </Text>
                          <View style={[styles.aptStatusBadge, { backgroundColor: getStatusColor(apt.status as any) }]}>
                            <Text style={styles.aptStatusText}>{apt.status}</Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'scheduled':
      return theme.colors.primary;
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
    case 'no-show':
      return '#F44336';
    default:
      return '#999';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  treatmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treatmentType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  treatmentDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  treatmentCost: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  scheduleButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsSubSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  appointmentsSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  appointmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  appointmentText: {
    fontSize: 14,
    color: '#666',
  },
  aptStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  aptStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default PatientDetailScreen;
