#!/usr/bin/env bash

# ToothTime Keystore Generation Script
# This script generates a release keystore and displays the SHA-1 fingerprint

set -e

echo "🔐 Generating ToothTime Release Keystore..."

# Create keystores directory if it doesn't exist
KEYSTORES_DIR="$HOME/keystores"
mkdir -p "$KEYSTORES_DIR"

KEYSTORE_PATH="$KEYSTORES_DIR/toothtime-release.jks"
KEY_ALIAS="toothtime_key"

# Check if keystore already exists
if [ -f "$KEYSTORE_PATH" ]; then
    echo "⚠️  Keystore already exists at $KEYSTORE_PATH"
    echo "Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "❌ Operation cancelled"
        exit 1
    fi
fi

echo "📝 Creating keystore at: $KEYSTORE_PATH"
echo "🔑 Key alias: $KEY_ALIAS"
echo ""

# Generate keystore
keytool -genkeypair -v \
    -keystore "$KEYSTORE_PATH" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storetype JKS

echo ""
echo "✅ Keystore generated successfully!"
echo ""
echo "📋 SHA-1 Fingerprint (add this to Google Cloud Console):"
echo "=================================================="

# Display SHA-1 fingerprint
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" | grep "SHA1:"

echo ""
echo "📁 Keystore location: $KEYSTORE_PATH"
echo ""
echo "📝 Next steps:"
echo "1. Copy the SHA-1 fingerprint above"
echo "2. Add it to your Android OAuth client in Google Cloud Console"
echo "3. Copy android/keystore.properties.template to android/keystore.properties"
echo "4. Update keystore.properties with your keystore details"
echo ""
echo "💡 For debug keystore SHA-1, run:"
echo "   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android"