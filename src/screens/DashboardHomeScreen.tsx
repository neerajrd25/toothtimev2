import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import auth, { User } from '../services/auth';
import db from '../services/db';
import { Appointment } from '../types';
import { colors } from '../theme';

const DashboardHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todaysPatients, setTodaysPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTodaysPatients();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysPatients = async () => {
    try {
      const patients = await db.getTodaysPatients();
      setTodaysPatients(patients);
    } catch (error) {
      console.error('Failed to load today\'s patients:', error);
    }
  };

  const loadTodaysAppointments = async () => {
    // For now, we'll keep this empty as requested
    // In the future, this would load from database or API
    setAppointments([]);
  };
  
  const formatDateForDisplay = (dbDate: string | null): string => {
    if (!dbDate) return '-';
    const parts = dbDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dbDate;
  };

  const handleProfilePress = () => {
    // For now, just show user info
    if (user) {
      Alert.alert('Profile', `Signed in as: ${user.name || user.email}`);
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentTime}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.appointmentType}>{item.type}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderEmptyAppointments = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No appointments today</Text>
      <Text style={styles.emptySubtitle}>You have a clear schedule for today!</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>ToothTime</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileContainer}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Ready to make some smiles brighter today?
          </Text>
        </View>

        {/* Today's Appointments */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Patients</Text>
            <Text style={styles.appointmentCount}>
              {todaysPatients.length} patient{todaysPatients.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.appointmentsList}>
            {todaysPatients.length > 0 ? (
              todaysPatients.map((patient) => (
                <View key={patient.id} style={styles.patientCard}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientCardName}>{patient.name}</Text>
                    {patient.treatment_type && (
                      <View style={styles.treatmentBadgeSmall}>
                        <Text style={styles.treatmentBadgeSmallText}>{patient.treatment_type}</Text>
                      </View>
                    )}
                  </View>
                  {patient.phone && (
                    <Text style={styles.patientCardContact}>{patient.phone}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No patients scheduled today</Text>
                <Text style={styles.emptySubtitle}>Your day is free!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('Patients', { screen: 'AddPatient' })}
            >
              <Text style={styles.actionButtonText}>+ Add Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => (navigation as any).navigate('Patients')}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>View All Patients</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileContainer: {
    marginLeft: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e1e5e9',
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  appointmentsSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  appointmentCount: {
    fontSize: 14,
    color: '#666',
  },
  appointmentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  appointmentTime: {
    marginRight: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonTextSecondary: {
    color: colors.primary,
  },
  patientCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  patientCardContact: {
    fontSize: 14,
    color: '#666',
  },
  treatmentBadgeSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  treatmentBadgeSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default DashboardHomeScreen;