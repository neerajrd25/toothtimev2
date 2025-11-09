import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const CalendarScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Appointment scheduling coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CalendarScreen;