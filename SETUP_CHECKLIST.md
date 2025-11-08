# ToothTime Setup Checklist

Use this checklist to ensure your ToothTime app is properly configured with Google Sign-In and SQLite.

## ✅ Pre-Setup Checklist

- [ ] Node.js >= 18 installed
- [ ] React Native development environment set up
- [ ] Android Studio installed with SDK
- [ ] Google account with Cloud Console access

## ✅ Dependencies & Configuration

- [x] Dependencies installed (`@react-native-google-signin/google-signin`, `react-native-sqlite-storage`, `react-native-config`)
- [x] TypeScript types installed (`@types/react-native-sqlite-storage`)
- [x] Environment template created (`.env.template`)
- [ ] Local environment file created (copy `.env.template` to `.env`)
- [ ] WEB_CLIENT_ID added to `.env` file

## ✅ Google Cloud Console Setup

- [ ] GCP project created/selected
- [ ] OAuth consent screen configured
- [ ] Test users added to OAuth consent screen
- [ ] Debug SHA-1 fingerprint generated
- [ ] Android OAuth client created (package: `com.toothtimev2`, SHA-1 fingerprint)
- [ ] Web OAuth client created (webClientId obtained)
- [ ] webClientId added to `.env` file

## ✅ Android Configuration

- [x] Package name set to `com.toothtimev2`
- [x] react-native-config integrated
- [x] Keystore template created (`android/keystore.properties.template`)
- [ ] Release keystore generated (optional, for production)
- [ ] Release SHA-1 added to Android OAuth client (if using release keystore)

## ✅ iOS Configuration (if targeting iOS)

- [ ] URL scheme configured in Info.plist
- [ ] iOS OAuth client created (optional)
- [ ] Pod dependencies installed (`npx pod-install`)

## ✅ Code Integration

- [x] App.tsx updated with auth & database initialization
- [x] Auth service integrated (`src/services/auth.ts`)
- [x] Database service integrated (`src/services/db.ts`)
- [x] User interface defined with proper TypeScript types
- [x] Error handling and logging implemented

## ✅ Security & Production

- [x] .gitignore updated (excludes .env, keystores, google-services.json)
- [x] Environment variables properly configured
- [x] Keystore management set up
- [ ] Production keystore generated and SHA-1 registered

## ✅ Testing

- [x] Integration test script available (`./scripts/test-integration.sh`)
- [ ] Integration test passes (`./scripts/test-integration.sh`)
- [ ] App builds successfully (`npm run android`)
- [ ] Google Sign-In works on Google Play-enabled device/emulator
- [ ] User data saves to SQLite database
- [ ] User session persists across app restarts

## ✅ Production Deployment

- [ ] Release keystore created and secured
- [ ] Release SHA-1 added to Google OAuth client
- [ ] keystore.properties configured (not committed to git)
- [ ] Signed APK/AAB builds successfully
- [ ] OAuth consent screen verified (if using sensitive scopes)

## 🛠️ Troubleshooting Commands

```bash
# Check integration
./scripts/test-integration.sh

# Generate debug SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Generate release keystore and SHA-1
./scripts/generate-keystore.sh

# Clean build
cd android && ./gradlew clean && cd ..

# Full rebuild
npm run android
```

## 📚 Documentation References

- [Complete Setup Guide](docs/SETUP_GOOGLE_SQLITE.md)
- [Quick Start Guide](docs/QUICK_START.md)
- [GCP Setup Guide](docs/GCP_GOOGLE_SIGNIN_SETUP.md)

---

**Status**: ✅ Integration Complete | 🔄 In Progress | ❌ Not Started

When all items are checked, your ToothTime app is ready for development and testing!