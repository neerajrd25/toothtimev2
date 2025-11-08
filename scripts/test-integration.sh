#!/usr/bin/env bash

# Integration test script for ToothTime setup
# Verifies that Google Sign-In and SQLite integration is working

set -e

echo "🧪 ToothTime Integration Test"
echo "============================="

# Check if environment file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "💡 Run: cp .env.template .env"
    exit 1
fi

# Check if WEB_CLIENT_ID is set
if ! grep -q "WEB_CLIENT_ID=.*[^[:space:]]" .env; then
    echo "❌ WEB_CLIENT_ID not set in .env file"
    echo "💡 Add your Google Web Client ID to .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed"
    echo "💡 Run: npm install"
    exit 1
fi

# Check if required packages are installed
if ! npm list @react-native-google-signin/google-signin &>/dev/null; then
    echo "❌ Google Sign-In package not found"
    echo "💡 Run: npm install"
    exit 1
fi

if ! npm list react-native-sqlite-storage &>/dev/null; then
    echo "❌ SQLite package not found"
    echo "💡 Run: npm install"
    exit 1
fi

if ! npm list react-native-config &>/dev/null; then
    echo "❌ React Native Config package not found"
    echo "💡 Run: npm install react-native-config"
    exit 1
fi

# Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Check linting
echo "🔍 Running ESLint..."
if ! npm run lint; then
    echo "❌ Linting failed"
    exit 1
fi

# Check if debug keystore exists
if [ ! -f "$HOME/.android/debug.keystore" ]; then
    echo "⚠️  Debug keystore not found at $HOME/.android/debug.keystore"
    echo "💡 This is normal for first-time setup"
else
    echo "✅ Debug keystore found"
fi

# Check Android build configuration
if [ ! -f "android/app/build.gradle" ]; then
    echo "❌ Android build.gradle not found"
    exit 1
fi

if ! grep -q "com.toothtimev2" android/app/build.gradle; then
    echo "❌ Package name not configured correctly"
    echo "💡 Should be: com.toothtimev2"
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up Google Cloud Console (see docs/SETUP_GOOGLE_SQLITE.md)"
echo "2. Add SHA-1 fingerprint to OAuth client"
echo "3. Test on Google Play-enabled emulator or device"
echo ""
echo "🚀 Ready to run: npm run android"