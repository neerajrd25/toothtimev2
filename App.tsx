/**
 * ToothTime React Native App
 * A dentist companion app
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CONFIG from './src/config';

// Import services
import auth from './src/services/auth';
import db from './src/services/db';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';

// Import types
import { NavigationStackParamList, User } from './src/types';

const Stack = createStackNavigator<NavigationStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const checkAuthState = setInterval(async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        if (!currentUser && user) {
          // User signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state check error:', error);
      }
    }, 1000); // Check every second

    return () => clearInterval(checkAuthState);
  }, [user]);

  const initializeApp = async () => {
    try {
      // Configure Google Sign-In
      if (CONFIG.WEB_CLIENT_ID && CONFIG.WEB_CLIENT_ID !== 'your-web-client-id-here.apps.googleusercontent.com') {
        auth.configure({ webClientId: CONFIG.WEB_CLIENT_ID });
        console.log('Google Sign-In configured successfully');
      } else {
        console.warn('WEB_CLIENT_ID not configured in src/config/index.ts');
        // Still configure with empty string to avoid crashes
        auth.configure({ webClientId: '' });
      }

      // Initialize database
      await db.openDB();
      console.log('Database initialized successfully');
      
      // Check if user is already signed in
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      
      setIsInitialized(true);
      setIsCheckingAuth(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsInitialized(true);
      setIsCheckingAuth(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };



  if (showSplash || !isInitialized || isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <SplashScreen onFinish={handleSplashFinish} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}>
          {user ? (
            // User is signed in, show Dashboard
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          ) : (
            // User is not signed in, show auth screens
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onAuthSuccess={handleAuthSuccess} />}
              </Stack.Screen>
              <Stack.Screen name="SignUp">
                {(props) => <SignUpScreen {...props} onAuthSuccess={handleAuthSuccess} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});