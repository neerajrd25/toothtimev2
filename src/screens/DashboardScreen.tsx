import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardTabParamList } from '../types';
import { CommonActions } from '@react-navigation/native';

// Import screens
import DashboardHomeScreen from './DashboardHomeScreen';
import PatientsScreen from './PatientsScreen';
import CalendarScreen from './CalendarScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import AddPatientScreen from './AddPatientScreen';
import PatientDetailScreen from './PatientDetailScreen';
import AddTreatmentScreen from './AddTreatmentScreen';
import ScheduleAppointmentScreen from './ScheduleAppointmentScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator<DashboardTabParamList>();
const PatientsStack = createStackNavigator();
const SettingsStack = createStackNavigator();

const PatientsStackScreen: React.FC = () => (
  <PatientsStack.Navigator screenOptions={{ headerShown: false }}>
    <PatientsStack.Screen name="PatientsMain" component={PatientsScreen} />
    <PatientsStack.Screen name="AddPatient" component={AddPatientScreen} />
    <PatientsStack.Screen 
      name="PatientDetail" 
      component={PatientDetailScreen as any} 
    />
    <PatientsStack.Screen 
      name="AddTreatment" 
      component={AddTreatmentScreen as any} 
    />
    <PatientsStack.Screen 
      name="ScheduleAppointment" 
      component={ScheduleAppointmentScreen as any} 
    />
  </PatientsStack.Navigator>
);

const SettingsStackScreen: React.FC = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    <SettingsStack.Screen name="Profile" component={ProfileScreen as any} />
  </SettingsStack.Navigator>
);

const DashboardScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
  tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e1e5e9',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Patients"
        component={PatientsStackScreen}
        options={{
          tabBarLabel: 'Patients',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Patients" color={color} focused={focused} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Patients',
                params: {
                  screen: 'PatientsMain',
                },
              })
            );
          },
        })}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component using shapes for now
const TabIcon: React.FC<{ name: string; color: string; focused: boolean }> = ({ 
  name, 
  color, 
  focused 
}) => {
  const getIconComponent = () => {
    switch (name) {
      case 'Home':
        return (
          <View style={[styles.iconContainer, { borderColor: color }]}>
            <View style={[styles.homeIcon, { backgroundColor: color }]} />
          </View>
        );
      case 'Patients':
        return (
          <View style={styles.iconContainer}>
            <View style={[styles.personIcon, { backgroundColor: color }]} />
            <View style={[styles.personIcon, styles.personIconSecond, { backgroundColor: color }]} />
          </View>
        );
      case 'Calendar':
        return (
          <View style={[styles.calendarIcon, { borderColor: color }]}>
            <View style={[styles.calendarTop, { backgroundColor: color }]} />
          </View>
        );
      case 'Settings':
        return (
          <View style={[styles.settingsIcon, { backgroundColor: color }]} />
        );
      default:
        return <View style={[styles.defaultIcon, { backgroundColor: color }]} />;
    }
  };

  return (
    <View style={[styles.tabIcon, focused && styles.focusedTab]}>
      {getIconComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  focusedTab: {
    transform: [{ scale: 1.1 }],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    width: 20,
    height: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  personIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  personIconSecond: {
    marginLeft: -4,
    opacity: 0.6,
  },
  calendarIcon: {
    width: 18,
    height: 16,
    borderWidth: 2,
    borderRadius: 3,
    position: 'relative',
  },
  calendarTop: {
    width: 10,
    height: 2,
    position: 'absolute',
    top: 2,
    left: 2,
  },
  settingsIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  defaultIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});

export default DashboardScreen;