import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import CONFIG from '../config';
import db from './db';

// Custom user interface that matches what we actually need
export interface User {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
}

/**
 * Auth service wrapper for Google Sign-In.
 *
 * Notes:
 * - You must call `configure` on app startup with your webClientId (from Google Cloud Console)
 * - Android/iOS native setup steps are required (see docs/SETUP_GOOGLE_SQLITE.md)
 * - webClientId can be provided via parameter or environment variable (WEB_CLIENT_ID)
 */

const configure = (options?: { webClientId?: string }) => {
  const webClientId = options?.webClientId || CONFIG.WEB_CLIENT_ID || '';
  
  if (!webClientId || webClientId === 'your-web-client-id-here.apps.googleusercontent.com') {
    console.warn('No valid webClientId provided for Google Sign-In. Sign-in will fail.');
    console.warn('Please set WEB_CLIENT_ID in src/config/index.ts or pass webClientId to configure()');
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  
  console.log('Google Sign-In configured with webClientId:', webClientId ? 'SET' : 'NOT SET');
};

async function signIn(): Promise<User | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    return userInfo?.user ? userInfo.user : null;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert('Sign in', 'Sign-in already in progress');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert('Play Services', 'Google Play Services not available or outdated');
      return null;
    } else {
      console.warn('Google sign in error', error);
      Alert.alert('Sign in error', error?.message || 'Unknown error');
      return null;
    }
  }
}

async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch (e) {
    console.warn('Sign out error', e);
  }
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) return null;
    const userInfo = await GoogleSignin.getCurrentUser();
    const user = userInfo?.user;
    
    if (!user) return null;
    
    // Check database for updated user info (name might be updated in profile)
    const dbUser = await db.getUserById(user.id);
    
    return {
      id: user.id,
      name: dbUser?.name || user.name,
      email: dbUser?.email || user.email,
      photo: user.photo,
    };
  } catch (e) {
    console.warn('getCurrentUser error', e);
    return null;
  }
}

/** Convenience: sign-in and persist user in local SQLite DB */
async function signInAndSave(): Promise<User | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const user = userInfo?.user;
    
    if (!user) return null;

    // Save or update user in database with profile fields
    const saved = await db.saveUser({
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
      photo: user.photo ?? '',
    });

    if (saved) {
      // Check if profile exists, if not create default profile entry
      const profile = await db.getUserProfile(user.id);
      if (!profile) {
        // Initialize profile with default empty values
        await db.updateUserProfile(user.id, {
          name: user.name ?? '',
          email: user.email ?? '',
          phone: '',
          qualification: '',
          experience: '',
        });
      }
    }

    return saved ? { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      photo: user.photo 
    } : null;
  } catch (error: any) {
    console.warn('Sign in and save error', error);
    if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert('Sign in error', error?.message || 'Unknown error');
    }
    return null;
  }
}

export default {
  configure,
  signIn,
  signOut,
  getCurrentUser,
  signInAndSave,
};
