import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import db from '../services/db';
import { colors } from '../theme';
import { Patient } from '../types';

type Props = {
  navigation: any;
};

const PatientsScreen: React.FC<Props> = ({ navigation }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const loadPatients = async () => {
    const list = await db.getPatients();
    setPatients(list as any);
    setFilteredPatients(list as any);
  };
  
  // Filter patients based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPatients(patients);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(lowercaseQuery) ||
      (patient.phone && patient.phone.toLowerCase().includes(lowercaseQuery)) ||
      (patient.email && patient.email.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredPatients(filtered);
  };
  
  // Convert YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateForDisplay = (dbDate: string | null): string => {
    if (!dbDate) return '-';
    const parts = dbDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dbDate;
  };

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddPatient')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.content}>
        {filteredPatients.length === 0 ? (
          <Text style={styles.subtitle}>
            {searchQuery ? 'No patients found matching your search.' : 'No patients yet. Tap + to add one.'}
          </Text>
        ) : (
          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.patientCard}
                onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
              >
                <View style={styles.patientHeader}>
                  <Text style={styles.patientName}>{item.name}</Text>
                  {(item as any).treatment_type && (
                    <View style={styles.treatmentBadge}>
                      <Text style={styles.treatmentBadgeText}>{(item as any).treatment_type}</Text>
                    </View>
                  )}
                </View>
                {(item.phone || item.email) && (
                  <Text style={styles.patientContact}>{item.phone || item.email}</Text>
                )}
                <View style={styles.patientFooter}>
                  <Text style={styles.visitDateLabel}>First Visit:</Text>
                  <Text style={styles.visitDate}>{formatDateForDisplay((item as any).first_visit_date)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  treatmentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  treatmentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  patientContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  patientFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  visitDateLabel: {
    fontSize: 13,
    color: '#999',
    marginRight: 6,
  },
  visitDate: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  patientRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e5e9',
  },
  patientMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default PatientsScreen;