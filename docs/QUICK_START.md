# ToothTime Quick Setup Guide

This guide helps you get ToothTime up and running with Google Sign-In and SQLite storage.

## Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template and add your Google Web Client ID
cp .env.template .env
# Edit .env and add your WEB_CLIENT_ID (see SETUP_GOOGLE_SQLITE.md for details)
```

### 2. Install Dependencies
```bash
npm install
npx pod-install  # iOS only
```

### 3. Get Your Debug SHA-1 Fingerprint
```bash
cd android && ./gradlew signingReport
# Look for the "SHA1:" value in the debug section
```

### 4. Create Google OAuth Clients (BOTH Required)

### 3. Get Google Web Client ID (Required for Sign-In)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth client ID → Web application
4. Copy the Client ID and add to `.env` file:
   ```
   WEB_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

### 4. Get SHA-1 Fingerprint for Android
```bash
# For development (debug keystore)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Or use our helper script
./scripts/generate-keystore.sh  # For release keystore
```

### 5. Configure Android OAuth Client
1. In Google Cloud Console → Credentials
2. Create OAuth client ID → Android
3. Package: `com.toothtimev2`
4. SHA-1: Use fingerprint from step 4

### 6. Run the App
```bash
# Start Metro bundler
npm start

# Run on Android (use Google Play-enabled emulator)
npm run android
```

## Testing Google Sign-In
1. Open app on Google Play-enabled emulator or real device
2. Tap "Continue with Google" 
3. Sign in with test account (must be added to OAuth consent screen)
4. User should be saved to local SQLite database

## Troubleshooting
- **No webClientId error**: Add WEB_CLIENT_ID to .env file
- **DEVELOPER_ERROR**: Wrong webClientId or missing Android OAuth client
- **PLAY_SERVICES_NOT_AVAILABLE**: Use Google Play emulator or real device

## Full Documentation
See `docs/SETUP_GOOGLE_SQLITE.md` for complete setup instructions including:
- OAuth consent screen setup
- iOS configuration
- Production deployment
- Keystore management
- Environment variable security

## Key Files
- `.env` - Environment variables (never commit)
- `.env.template` - Template for environment setup
- `src/services/auth.ts` - Google Sign-In service
- `src/services/db.ts` - SQLite database service
- `docs/SETUP_GOOGLE_SQLITE.md` - Complete setup guide