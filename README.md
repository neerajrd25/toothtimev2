# ToothTime Mobile App

A React Native dental care companion app focusing on Android development.

## Getting Started

### Prerequisites
- Node.js >= 18
- React Native development environment
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

Start the Metro bundler:
```bash
npm start
```

#### Android
```bash
npm run android
```

## Architecture

This app follows clean React Native architecture patterns:
- React Navigation for screen navigation
- TypeScript for type safety
- UI-only implementation (no database integration yet)
- Android-focused development

## Features

- ✅ Splash screen with animated logo
- ✅ Login screen with form validation
- ✅ Sign up screen with form validation
- 🚧 Authentication (UI only - backend integration pending)

## Screens

1. **Splash Screen**: Animated intro with automatic navigation to login
2. **Login Screen**: Email/password login with validation
3. **Sign Up Screen**: User registration with form validation

## Development Notes

- **Android Only**: Currently configured for Android development only
- **UI Focus**: The app currently focuses on UI implementation
- **Clean Setup**: All unnecessary dependencies and configurations have been removed
- **Future Ready**: Database integration and authentication will be added in future iterations