# GCP / Google Sign‑In setup for ToothTime

This document describes the exact steps to configure Google Sign‑In for your Android app and obtain the Web client ID (webClientId) required by `@react-native-google-signin/google-signin`. It also covers where to store keys locally, how to wire the client ID into the app, and CI/Play Store notes — matching the approach used in EnvelopeV2.

Keep sensitive files out of source control (keystores, google-services.json, .env). Use templates (`.env.template`, `keystore.properties.template`) that you commit instead.

## Quick summary
- Create a GCP project (or reuse one).
- Configure OAuth consent screen (External for testing) and add test users.
- Create an Android OAuth client (package + SHA‑1) and a Web OAuth client (webClientId).
- Store `webClientId` in an environment variable and call `auth.configure({ webClientId })` at app startup.
- Keep keystores and google‑service config out of git; use CI secrets for builds.

## Prerequisites
- Google account with GCP access
- Android package name (this project uses `com.toothtimev2`)
- Java JDK / Android SDK (for keytool / Gradle)

## 1. Create or select a GCP project
1. Open https://console.cloud.google.com/ and select or create a project (e.g. `ToothTime Dev`).
2. Make sure it's selected in the top bar for the following steps.

## 2. Configure OAuth consent screen
1. Go to **APIs & Services → OAuth consent screen**.
2. Choose **External** (for development/testing) and click Continue.
3. Fill in required fields: App name, support email, developer contact email.
4. Add the emails that will test the app as **Test users**.
5. Save and finish the flow.

## 3. Obtain SHA‑1 fingerprints (debug and release)
Use one of the methods below:

### A. Default debug keystore
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Copy the `SHA1:` value.

### B. Gradle signingReport
From your project root:
```bash
cd android
./gradlew signingReport
```
Look for the `Variant: debug` (or release) and copy the SHA‑1 value.

### C. Release keystore (if you have one)
```bash
keytool -list -v -keystore /path/to/your/release-keystore.jks -alias your_alias
```

> Note: register both debug and release SHA‑1 values in GCP (debug for local dev, release for Play Store uploads).

## 4. Create OAuth client IDs
### Android client
1. In GCP: **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Select **Android**.
3. Enter a name (e.g., `ToothTime Android Debug`), package name `com.toothtimev2`, and the SHA‑1 fingerprint from step 3.
4. Create.

### Web client (webClientId)
1. In Credentials → Create credentials → **OAuth client ID** → **Web application**.
2. Name it `ToothTime Web Client`.
3. Leave Authorized JavaScript origins and redirect URIs empty (not required for RN client usage).
4. Create and copy the **Client ID** value — this is the `webClientId` you will use in the app.

## 5. (Optional) iOS client
- If you also target iOS, create an iOS OAuth client (bundle id) and/or obtain `GoogleService-Info.plist` if you use Firebase. The JS SDK primarily needs `webClientId`.

## 6. Local storage of native files and keys (recommended structure)
- Do NOT commit secrets. Recommended layout:

```
toothtimev2/
├─ android/
│  └─ app/
│     └─ google-services.json   # optional, DO NOT commit
├─ ios/
│  └─ GoogleService-Info.plist  # optional, DO NOT commit
├─ secrets/
│  └─ toothtime-release.jks     # optional, DO NOT commit
├─ keystore.properties          # excluded from git (contains passwords/paths)
├─ .env                         # local env, excluded
├─ .env.template                # committed, placeholder values
```

Add these to `.gitignore`:
```
google-services.json
GoogleService-Info.plist
*.jks
keystore.properties
.env
.env.*
```

## 7. Add `webClientId` to the app (recommended: env var)
- Create `.env.template` with:
```
WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE
```
- Add `.env` to `.gitignore` and populate `.env` locally with the real client ID.
- Use `react-native-config` or another safe mechanism to read env vars in JS. Example with `react-native-config`:

App.tsx snippet:

```ts
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from './src/services/auth';
import Config from 'react-native-config';

export default function App() {
  useEffect(() => {
    auth.configure({ webClientId: Config.WEB_CLIENT_ID });
  }, []);

  return (
    <SafeAreaProvider>{/* ... */}</SafeAreaProvider>
  );
}
```

If you don't want to add `react-native-config`, you can temporarily paste the client id directly in `auth.configure` while developing.

## 8. Android signing configuration (mirror EnvelopeV2)
1. Store your release keystore in `secrets/toothtime-release.jks` (or in a secure location).
2. Create `keystore.properties` (ignored) with:
```
storeFile=../secrets/toothtime-release.jks
storePassword=your_store_password
keyAlias=toothtime_key
keyPassword=your_key_password
```
3. In `android/app/build.gradle` load the properties and wire `signingConfigs` (see EnvelopeV2 for an example). This keeps credentials out of the repo.

## 9. CI and secrets
- In CI (GitHub Actions, Bitrise, CircleCI) store:
  - `WEB_CLIENT_ID` env var (for builds/tests)
  - Keystore file (as encrypted secret/artifact) and keystore passwords as secrets
- In the build pipeline, write the keystore to disk and create `keystore.properties` before running Gradle.

## 10. Testing locally
- Use a Google Play-enabled emulator image (Pixel with Google Play) so Play Services are available.
- Run the app:
```bash
npm install
npm run android
```
- Tap **Continue with Google** on the Login screen. The first time you sign in you will see the OAuth consent screen for the test user(s) you added.

## 11. Troubleshooting
- INVALID_CREDENTIALS / redirect_uri_mismatch: check that you used the Web client ID for `webClientId` and that Android client was created with correct package+SHA‑1.
- PLAY_SERVICES_NOT_AVAILABLE: use a Google Play-enabled emulator or a real device with Play Services.
- SIGN_IN_CANCELLED: the user canceled the flow.
- If sign-in fails, run `adb logcat` and filter logs for `Google` or `ReactNativeJS` to see errors.

## 12. Publishing notes
- When publishing, add the release SHA‑1 (upload or app signing key) to the Android OAuth client in GCP.
- If you use Google Play App Signing, also register the Play App Signing key fingerprint in GCP.
- If your app requests sensitive scopes beyond profile/email, you may need to submit your OAuth consent screen for verification.

## 13. Optional automation (EnvelopeV2-like)
- Add a `scripts/generate-keystore.sh` helper that creates a keystore and prints SHA‑1. Example:
```bash
#!/usr/bin/env bash
mkdir -p ~/keystores
keytool -genkeypair -v -keystore ~/keystores/toothtime-release.jks -alias toothtime_key \
  -keyalg RSA -keysize 2048 -validity 10000
echo "SHA1:"
keytool -list -v -keystore ~/keystores/toothtime-release.jks -alias toothtime_key
```

## Checklist (copy/paste)
- [ ] Create/select GCP project
- [ ] Configure OAuth consent screen (add test users)
- [ ] Obtain debug & release SHA‑1
- [ ] Create Android OAuth client (package + SHA‑1)
- [ ] Create Web OAuth client and copy webClientId
- [ ] Add `WEB_CLIENT_ID` to `.env` (or CI secrets)
- [ ] Call `auth.configure({ webClientId })` at startup
- [ ] Keep keystore/credentials out of git and add templates
- [ ] Test on Google Play-enabled emulator or device

If you'd like, I can:
- add `.env.template` and wire `react-native-config` into the project and update `App.tsx` to call `auth.configure`, or
- add the `scripts/generate-keystore.sh` helper and a `keystore.properties.template` so you can follow EnvelopeV2's pattern.

Pick which one and I will apply the changes and run lint/checks.
