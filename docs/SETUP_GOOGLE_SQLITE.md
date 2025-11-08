# Google Sign-In and SQLite Integration Guide for ToothTime

This comprehensive guide walks through setting up Google Sign-In and SQLite storage for the ToothTime React Native app, following the same patterns used in EnvelopeV2.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Dependencies Installation](#dependencies-installation)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Environment Configuration](#environment-configuration)
5. [Android Configuration](#android-configuration)
6. [iOS Configuration](#ios-configuration)
7. [App Integration](#app-integration)
8. [SQLite Database Setup](#sqlite-database-setup)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

- Google account with Google Cloud Console access
- Android Studio with SDK (for Android development)
- Xcode (for iOS development)
- Node.js and npm/yarn
- React Native development environment set up

## Dependencies Installation

The required dependencies are already added to `package.json`. If you need to reinstall:

```bash
# Core dependencies (already installed)
npm install @react-native-google-signin/google-signin react-native-sqlite-storage

# For environment variables (recommended)
npm install react-native-config

# iOS only - install native dependencies
npx pod-install
```

## Google Cloud Console Setup

### 1. Create or Select GCP Project
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one (e.g., "ToothTime")
3. Note the project ID for later reference

### 2. Configure OAuth Consent Screen
1. Navigate to **APIs & Services → OAuth consent screen**
2. Select **External** (for development/testing)
3. Fill in required fields:
   - App name: "ToothTime"
   - Support email: your email
   - Developer contact: your email
4. Add test users (emails that can sign in during development)
5. Save and continue through all steps

### 3. Get SHA-1 Fingerprints

For development (debug keystore):
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Alternative using Gradle:
```bash
cd android
./gradlew signingReport
```

Copy the SHA-1 fingerprint from the output.

### 4. Create OAuth Client IDs

#### Android Client
1. **APIs & Services → Credentials → Create credentials → OAuth client ID**
2. Select **Android**
3. Enter:
   - Name: "ToothTime Android"
   - Package name: `com.toothtimev2`
   - SHA-1 certificate fingerprint: (from step 3)
4. Create

#### Web Client (for webClientId)
1. **Create credentials → OAuth client ID → Web application**
2. Name: "ToothTime Web Client"
3. Leave Authorized JavaScript origins and redirect URIs empty
4. Create and **copy the Client ID** - this is your `webClientId`

## Environment Configuration

### 1. Create Environment Files

Create `.env.template` (commit this to git):
```bash
# Google Sign-In Configuration
WEB_CLIENT_ID=your_web_client_id_here

# Database Configuration
DB_NAME=toothtime.db

# App Configuration
APP_NAME=ToothTime
APP_VERSION=1.0.0
```

Create `.env` (add to .gitignore, never commit):
```bash
WEB_CLIENT_ID=643406380185-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
DB_NAME=toothtime.db
APP_NAME=ToothTime
APP_VERSION=1.0.0
```

### 2. Update .gitignore

Add to `.gitignore`:
```gitignore
# Environment files
.env
.env.local
.env.*.local

# Keystore files
*.keystore
*.jks
keystore.properties

# Google Services files
android/app/google-services.json
ios/GoogleService-Info.plist
```

### 3. Install react-native-config

```bash
npm install react-native-config
npx pod-install  # iOS only
```

## Android Configuration

### 1. Update android/app/build.gradle

Add at the top:
```gradle
apply plugin: "com.android.application"
apply plugin: 'react-native-config'  // Add this line
```

### 2. Configure Package Name

Ensure `android/app/build.gradle` has:
```gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.toothtimev2"  // Must match GCP setup
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
}
```

### 3. ProGuard Configuration (if using)

Add to `android/app/proguard-rules.pro`:
```proguard
-keep class com.google.android.gms.** { *; }
-keep class androidx.credentials.** { *; }
```

## iOS Configuration

### 1. Configure URL Scheme

In `ios/toothtimev2/Info.plist`, add before the closing `</dict>`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>GoogleSignIn</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

Replace `YOUR_REVERSED_CLIENT_ID` with the reversed version of your web client ID (e.g., if web client ID is `123456-abc.apps.googleusercontent.com`, use `com.googleusercontent.apps.123456-abc`).

### 2. Update Podfile

In `ios/Podfile`, ensure you have:
```ruby
use_frameworks! :linkage => :static  # If needed for Google Sign-In
```

## App Integration

### 1. Update App.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Config from 'react-native-config';
import auth from './src/services/auth';
import db from './src/services/db';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// Import types
import { NavigationStackParamList } from './src/types';

const Stack = createStackNavigator<NavigationStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Configure Google Sign-In
      if (Config.WEB_CLIENT_ID) {
        auth.configure({ webClientId: Config.WEB_CLIENT_ID });
      } else {
        console.warn('WEB_CLIENT_ID not found in environment variables');
      }

      // Initialize database
      await db.openDB();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsInitialized(true); // Allow app to continue even if init fails
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash || !isInitialized) {
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
          initialRouteName="Login"
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
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
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
```

### 2. Update Services (if needed)

The existing `auth.ts` and `db.ts` services are well-structured. You may want to enhance them with error logging:

Add to `src/services/auth.ts` (optional enhancement):
```typescript
// Add at the top
import Config from 'react-native-config';

// Update configure method to use env var as fallback
const configure = (options?: { webClientId?: string }) => {
  const webClientId = options?.webClientId || Config.WEB_CLIENT_ID || '';
  
  if (!webClientId) {
    console.warn('No webClientId provided for Google Sign-In');
    return;
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
};
```

## SQLite Database Setup

The existing `db.ts` service handles SQLite setup. You can enhance it by adding more tables as needed:

```typescript
// In src/services/db.ts, add more tables in openDB function
const openDB = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  try {
    dbInstance = await SQLite.openDatabase({ name: 'toothtime.db', location: 'default' });
    
    // Create users table
    await dbInstance.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Add more tables as needed for your app
    await dbInstance.executeSql(
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date_time DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    return dbInstance;
  } catch (e) {
    console.warn('openDB error', e);
    Alert.alert('Database error', String(e));
    throw e;
  }
};
```

## Testing

### 1. Local Development Testing

```bash
# Start the Metro bundler
npm start

# Run on Android (use Google Play-enabled emulator)
npm run android

# Run on iOS (if configured)
npm run ios
```

### 2. Test Google Sign-In

1. Open the app in a Google Play-enabled emulator or real device
2. Tap "Continue with Google" on the login screen
3. You should see the OAuth consent screen
4. Sign in with a test user you added to the GCP console
5. Check that the user is saved to SQLite database

### 3. Debugging

Check logs for any issues:
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

## Production Deployment

### 1. Release Keystore for Android

Generate a release keystore:
```bash
keytool -genkeypair -v -keystore ~/keystores/toothtime-release.jks \
  -alias toothtime_key -keyalg RSA -keysize 2048 -validity 10000
```

Get the SHA-1 for release:
```bash
keytool -list -v -keystore ~/keystores/toothtime-release.jks -alias toothtime_key
```

Add this SHA-1 to your Android OAuth client in Google Cloud Console.

### 2. Configure Signing

Create `android/keystore.properties` (never commit this):
```properties
storeFile=../../../keystores/toothtime-release.jks
storePassword=your_store_password
keyAlias=toothtime_key
keyPassword=your_key_password
```

Update `android/app/build.gradle`:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **DEVELOPER_ERROR**: Web client ID is incorrect or not configured
   - Solution: Double-check the webClientId in your .env file

2. **SIGN_IN_CANCELLED**: User cancelled the sign-in flow
   - This is normal user behavior, handle gracefully

3. **PLAY_SERVICES_NOT_AVAILABLE**: Google Play Services not available
   - Use a Google Play-enabled emulator
   - Ensure real device has Google Play Services installed

4. **Network Error**: 
   - Check internet connection
   - Ensure emulator/device can access Google services

5. **SQLite errors**:
   - Check that react-native-sqlite-storage is properly linked
   - Verify database initialization in db.ts

### Debug Steps

1. Check environment variables are loaded:
```javascript
console.log('WEB_CLIENT_ID:', Config.WEB_CLIENT_ID);
```

2. Verify Google Sign-In configuration:
```javascript
console.log('Google Sign-In configured:', GoogleSignin.configure);
```

3. Test SQLite connection:
```javascript
db.openDB().then(() => console.log('DB connected')).catch(console.error);
```

### Support Resources

- [Google Sign-In for React Native Documentation](https://github.com/react-native-google-signin/google-signin)
- [React Native SQLite Storage Documentation](https://github.com/andpor/react-native-sqlite-storage)
- [Google Cloud Console](https://console.cloud.google.com/)

## Next Steps

After completing this setup:

1. Test the complete sign-in flow
2. Add error handling and user feedback
3. Implement user session persistence
4. Add more database tables as needed
5. Set up automated testing
6. Configure CI/CD with proper secrets management

For questions or issues, refer to the EnvelopeV2 implementation as a reference or check the troubleshooting section above.
