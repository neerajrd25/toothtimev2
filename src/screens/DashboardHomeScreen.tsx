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
  Linking,
  Platform,
  TouchableWithoutFeedback,
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
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [todaysPatients, setTodaysPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTodaysPatients();
      loadUpcomingAppointments();
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

  const loadUpcomingAppointments = async () => {
    try {
      const appointments = await db.getUpcomingAppointments();
      setUpcomingAppointments(appointments);
    } catch (error) {
      console.error('Failed to load upcoming appointments:', error);
    }
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

  const handleReschedule = (appointmentId: string) => {
    setMenuVisible(null);
    Alert.alert('Reschedule', 'Reschedule feature coming soon!');
  };

  const handleCancel = (appointmentId: string) => {
    setMenuVisible(null);
    Alert.alert('Cancel', 'Cancel appointment feature coming soon!');
  };

  const handleNotify = async (appointment: any) => {
    setMenuVisible(null);
    if (!appointment.patient_phone) {
      Alert.alert('Error', 'Patient phone number not available');
      return;
    }

    const message = `Dear ${appointment.patient_name},\n\nReminder: Your appointment for ${appointment.treatment_type} is scheduled.\n\nDate: ${formatDateForDisplay(appointment.appointment_date)}\nTime: ${appointment.appointment_time}\nDuration: ${appointment.duration_minutes} minutes\n\nPlease arrive 10 minutes early.\n\nThank you,\nToothTime Dental Clinic`;

    const url = `sms:${appointment.patient_phone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    
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

  const toggleMenu = (appointmentId: string) => {
    setMenuVisible(menuVisible === appointmentId ? null : appointmentId);
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
          <View style={styles.appNameContainer}>
            <View style={styles.logoIcon}>
              <Image 
                source={require('../assets/images/tooth_icon.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>ToothTime</Text>
          </View>
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
        <TouchableWithoutFeedback onPress={() => setMenuVisible(null)}>
          <View>
            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </Text>
              <Text style={styles.welcomeSubtext}>
                Ready to make some smiles brighter today?
              </Text>
            </View>

        {/* Upcoming Appointments */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <Text style={styles.appointmentCount}>
              {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.appointmentsList}>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentPatientInfo}>
                      <Text style={styles.appointmentPatientName}>{appointment.patient_name}</Text>
                      <View style={styles.treatmentBadgeSmall}>
                        <Text style={styles.treatmentBadgeSmallText}>{appointment.treatment_type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={() => toggleMenu(appointment.id)}
                    >
                      <Text style={styles.menuIcon}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.appointmentDetailsRow}>
                    <Text style={styles.appointmentDateTime}>
                      📅 {formatDateForDisplay(appointment.appointment_date)} • 🕐 {appointment.appointment_time}
                    </Text>
                    <Text style={styles.appointmentDuration}>
                      ⏱️ {appointment.duration_minutes} min
                    </Text>
                  </View>
                  {appointment.patient_phone && (
                    <Text style={styles.patientCardContact}>📱 {appointment.patient_phone}</Text>
                  )}
                  
                  {/* Dropdown Menu */}
                  {menuVisible === appointment.id && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity 
                        style={styles.menuOption}
                        onPress={() => handleReschedule(appointment.id)}
                      >
                        <Text style={styles.menuOptionIcon}>🔄</Text>
                        <Text style={styles.menuOptionText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.menuOption}
                        onPress={() => handleCancel(appointment.id)}
                      >
                        <Text style={styles.menuOptionIcon}>❌</Text>
                        <Text style={styles.menuOptionText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.menuOption}
                        onPress={() => handleNotify(appointment)}
                      >
                        <Text style={styles.menuOptionIcon}>📱</Text>
                        <Text style={styles.menuOptionText}>Send Notification</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No upcoming appointments</Text>
                <Text style={styles.emptySubtitle}>Schedule appointments from patient details</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions - Removed */}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => (navigation as any).navigate('Patients', { screen: 'AddPatient' })}
      >
        <Text style={styles.fabIcon}>👤</Text>
        <Text style={styles.fabPlus}>+</Text>
      </TouchableOpacity>
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
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoImage: {
    width: 24,
    height: 24,
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
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  appointmentHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentPatientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flex: 1,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    lineHeight: 24,
  },
  appointmentPatientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  appointmentDetailsRow: {
    marginBottom: 6,
  },
  appointmentDateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appointmentDuration: {
    fontSize: 13,
    color: '#999',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 180,
    zIndex: 1000,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 20,
    position: 'absolute',
    top: 10,
    left: 20,
  },
  fabPlus: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});

export default DashboardHomeScreen;