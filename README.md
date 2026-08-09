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

2. **Configure Supabase (local `.env`):**

   Create an untracked local env file (never commit secrets):

   ```bash
   cp .env.example .env
   ```

   Then set both values in `.env` from the Supabase Dashboard
   (**Settings → API**) for project ref `yezhteuapxqomspindaz`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://yezhteuapxqomspindaz.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
   ```

   Restart Expo after changing `.env` so `EXPO_PUBLIC_*` values reload.

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

- Copy `.env.example` to `.env` for local development (`.env` is gitignored)
- Point the app at Supabase project ref `yezhteuapxqomspindaz`
- Put only the project URL and anon key in `.env` — never commit real keys
- Box photos upload to the public `box-photos` Storage bucket at `{user_id}/{uuid}.{ext}`
- Ensure database schema matches between web and mobile
- Test authentication flow thoroughly

### iOS native (dev client) builds & troubleshooting

`npx expo start` + Expo Go works for JS-only changes, but this project uses a
**development build**, so building the native app locally (`npx expo run:ios`)
has a few extra requirements. Common gotchas:

- **CocoaPods must be installed.** Prefer Homebrew — the system-Ruby gem
  install fails on permissions:

  ```bash
  brew install cocoapods
  ```

- **An iOS Simulator runtime must be installed.** Xcode 26 ships without one;
  `xcrun simctl list runtimes` will be empty. Install one via:

  ```bash
  xcodebuild -downloadPlatform iOS   # or Xcode → Settings → Components
  ```

- **Do not build from a path containing spaces.** React Native's codegen build
  script is not space-safe and fails with
  `/bin/sh: /path/to/your: No such file or directory`. Clone/build from a path
  with no spaces (e.g. `~/code/binqr-mobile`, not `~/My Projects/binqr-mobile`).

### Production / EAS

App config lives in `app.config.ts` (including `extra.eas.projectId`). Do not commit secrets in `eas.json` or `.env`.

For EAS builds (TestFlight / production), set the same two variables as EAS Secrets
(or project environment variables) in the Expo dashboard / CLI so production
builds hit project `yezhteuapxqomspindaz`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Example (replace the anon key with the value from Supabase Dashboard → Settings → API):

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://yezhteuapxqomspindaz.supabase.co" --type string
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<your_anon_key>" --type string
```

List or update existing secrets with `eas secret:list` / `eas secret:delete` as needed.
Do not paste real anon keys into git, README examples, or PR descriptions.

### TestFlight CI (GitHub Actions + EAS)

Pushes to `main` (excluding markdown-only changes) and manual **Run workflow** trigger [`.github/workflows/testflight.yml`](.github/workflows/testflight.yml). That workflow runs on `ubuntu-latest`, installs dependencies, and starts an EAS cloud iOS production build with `--auto-submit --no-wait`. When the build finishes on EAS, submission goes to TestFlight using the `production` submit profile in `eas.json`.

**GitHub repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
| --- | --- |
| `EXPO_TOKEN` | Expo personal access token for EAS CLI in CI |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect API key ID → `EXPO_ASC_KEY_ID` |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | ASC issuer ID → `EXPO_ASC_ISSUER_ID` |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Full `.p8` key contents (written to a temp file → `EXPO_ASC_API_KEY_PATH`) |
| `ASC_APP_ID` | *(Optional)* Numeric App Store Connect app Apple ID (`ascAppId`). Required for auto-submit in CI until you commit `submit.production.ios.ascAppId` in `eas.json`. [How to find ascAppId](https://expo.fyi/asc-app-id). |

iOS distribution certificates and provisioning profiles are **not** checked into GitHub. EAS manages credentials remotely after you complete at least one interactive `eas build -p ios --profile production` locally (or via the Expo dashboard).

Set `EXPO_PUBLIC_*` Supabase variables as [EAS Secrets](https://docs.expo.dev/build-reference/variables/) for production builds; the TestFlight workflow does not embed them.

### Code Sharing with Web App

- Share types from `src/lib/types.ts`
- Reuse Supabase queries and auth logic
- Adapt UI components for mobile patterns

## 📦 Key Dependencies

- **Expo SDK 54** - Development platform (Xcode 26 / iOS 26 SDK for App Store Connect)
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
