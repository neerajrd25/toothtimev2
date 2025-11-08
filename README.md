# ToothTime Mobile App

A React Native dental care companion app with Google Sign-In and SQLite storage.

## Quick Start

For a 5-minute setup, see **[docs/QUICK_START.md](docs/QUICK_START.md)**

For complete setup instructions, see **[docs/SETUP_GOOGLE_SQLITE.md](docs/SETUP_GOOGLE_SQLITE.md)**

## Getting Started

### Prerequisites
- Node.js >= 18
- React Native development environment
- Android Studio (for Android development)
- Google Cloud Console account (for Google Sign-In)

### Installation

1. Install dependencies:
```bash
npm install
npx pod-install  # iOS only
```

2. Configure Google Sign-In:
```bash
# Copy environment template
cp .env.template .env
# Add your Google Web Client ID to .env file
```

3. Generate debug keystore SHA-1 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

4. Set up Google OAuth clients (see [setup guide](docs/SETUP_GOOGLE_SQLITE.md))

### Running the App

Start the Metro bundler:
```bash
npm start
```

#### Android
```bash
npm run android
```
**Note**: Use a Google Play-enabled emulator for Google Sign-In functionality.

## Architecture

This app follows clean React Native architecture patterns:
- React Navigation for screen navigation
- TypeScript for type safety
- Google Sign-In authentication
- SQLite local storage
- Environment-based configuration

## Features

- ✅ Splash screen with animated logo
- ✅ Login screen with Google Sign-In
- ✅ Sign up screen with form validation
- ✅ Google OAuth authentication
- ✅ SQLite database for user storage
- ✅ Environment variable configuration
- ✅ Secure keystore management

## Screens

1. **Splash Screen**: Animated intro with automatic navigation to login
2. **Login Screen**: Google Sign-In integration with fallback form
3. **Sign Up Screen**: User registration with form validation

## Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - 5-minute setup
- **[Complete Setup Guide](docs/SETUP_GOOGLE_SQLITE.md)** - Detailed configuration
- **[GCP Setup Guide](docs/GCP_GOOGLE_SIGNIN_SETUP.md)** - Google Cloud Console configuration

## Development Notes

- **Google Sign-In**: Requires proper GCP setup and environment configuration
- **SQLite Storage**: Local database for user data persistence  
- **Environment Security**: Credentials managed via .env files (never committed)
- **Android Focus**: Primary development target with iOS support available
- **Production Ready**: Includes keystore management and release configuration

## Key Files

- `.env.template` - Environment variable template
- `src/services/auth.ts` - Google Sign-In service
- `src/services/db.ts` - SQLite database service  
- `scripts/generate-keystore.sh` - Release keystore generator