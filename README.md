# BinQR Mobile App

A React Native app for organizing storage boxes with QR codes, built with Expo.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Expo Go app on your phone (for testing)

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Supabase:**

   - Update `src/lib/supabase.ts` with your Supabase URL and anon key
   - Or create a `.env` file (not tracked) with:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Start development server:**

   ```bash
   npx expo start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## 📱 Features

### Currently Implemented

- ✅ Authentication system (login)
- ✅ Bottom tab navigation
- ✅ QR code scanning with camera
- ✅ Basic home dashboard
- ✅ Settings with profile info

### Coming Soon

- 🚧 Box creation and management
- 🚧 QR code generation
- 🚧 Photo capture and storage
- 🚧 Search functionality
- 🚧 Location management
- 🚧 Offline storage with sync
- 🚧 Complete signup flow with invite codes

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React contexts (auth, etc.)
├── lib/               # Utilities and configurations
├── navigation/        # Navigation setup
├── screens/           # App screens
│   ├── auth/         # Authentication screens
│   └── ...           # Main app screens
└── types/            # TypeScript type definitions
```

## 🔧 Development

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add to navigation in `src/navigation/MainTabs.tsx`
3. Configure tab icon and options

### Environment Setup

- Copy your web app's Supabase configuration
- Ensure database schema matches between web and mobile
- Test authentication flow thoroughly

### Code Sharing with Web App

- Share types from `src/lib/types.ts`
- Reuse Supabase queries and auth logic
- Adapt UI components for mobile patterns

## 📦 Key Dependencies

- **Expo SDK 53** - Development platform
- **React Navigation** - Navigation system
- **Expo Camera** - QR scanning and photo capture
- **Supabase** - Backend and authentication
- **React Native Async Storage** - Local data storage

## 🎯 Next Steps for Full iOS Release

1. **Complete Core Features:**

   - Finish box creation flow
   - Implement QR code generation
   - Add photo management
   - Build search functionality

2. **iOS-Specific Setup:**

   - Configure app icons and splash screens
   - Set up proper bundle identifier
   - Test on physical iOS devices
   - Configure push notifications (if needed)

3. **App Store Preparation:**

   - Create App Store Connect account
   - Prepare app metadata and screenshots
   - Build production release with `eas build`
   - Submit for App Store review

4. **Production Considerations:**
   - Environment variable management
   - Error tracking (Sentry/Bugsnag)
   - Analytics integration
   - Performance monitoring

## 🔗 Related

- Web app: `../` (parent directory)
- Shared backend: Supabase (same instance)
- Design system: Consistent with web app

---

**Need help?** Check the [Expo documentation](https://docs.expo.dev/) or [React Navigation docs](https://reactnavigation.org/).
