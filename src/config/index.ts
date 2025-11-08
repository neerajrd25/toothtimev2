/**
 * Configuration for ToothTime app
 * Simple environment configuration without react-native-config
 */

// For development, you can directly set your values here
// In production, you would load these from a secure source
export const CONFIG = {
  // Replace this with your actual Web Client ID from Google Cloud Console
  // Example: '123456789-abc123def456.apps.googleusercontent.com'
  WEB_CLIENT_ID: '143412673055-1k6ccunl8hgfnoa3llt5sc6ba64hshbk.apps.googleusercontent.com',
  
  // Database configuration
  DB_NAME: 'toothtime.db',
  
  // App configuration
  APP_NAME: 'ToothTime',
  APP_VERSION: '1.0.0',
};

// Helper to check if configuration is valid
export const isConfigured = () => {
  return CONFIG.WEB_CLIENT_ID && CONFIG.WEB_CLIENT_ID !== 'your-web-client-id-here.apps.googleusercontent.com';
};

export default CONFIG;