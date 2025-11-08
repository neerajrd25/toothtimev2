import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { NavigationStackParamList, User } from '../types';
import theme, { makeStyles } from '../theme';
import auth from '../services/auth';

interface LoginScreenProps {
  navigation: NavigationProp<NavigationStackParamList, 'Login'>;
  onAuthSuccess?: (user: User) => void;
}

export default function LoginScreen({ navigation, onAuthSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // For now, just show success message (no database)
    Alert.alert('Success', 'Login functionality will be implemented soon!');
  };

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const styles = useLocalStyles;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.toothIcon}>🦷</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your ToothTime account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={theme.common.buttonPrimary} onPress={handleLogin}>
            <Text style={theme.common.buttonPrimaryText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={theme.common.buttonOutlined}
            onPress={async () => {
              if (isLoading) return;
              
              setIsLoading(true);
              try {
                const user = await auth.signInAndSave();
                if (user) {
                  console.log('Google Sign-In successful:', user);
                  onAuthSuccess?.(user);
                } else {
                  Alert.alert('Error', 'Sign-in was cancelled');
                }
              } catch (e) {
                console.warn('Google sign in flow error', e);
                Alert.alert('Error', 'Google sign-in failed. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#2E7D32" />
            ) : (
              <Text style={theme.common.buttonOutlinedText}>Continue with Google</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.signUpLink} onPress={goToSignUp}>
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useLocalStyles = makeStyles(({ colors, spacing, typography, common }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  toothIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    ...common.input,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.small,
    color: colors.muted,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: typography.body,
    color: colors.muted,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: '600',
  },
}));