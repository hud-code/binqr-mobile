import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "BinQR",
  slug: "binqr",
  version: "1.1.2",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.binqr.app",
    icon: "./assets/icon.png",
    buildNumber: "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDisplayName: "BinQR",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.binqr.app",
    icon: "./assets/icon.png",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow BinQR to access your camera to scan QR codes and photograph box contents.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow BinQR to access your photos to select images.",
      },
    ],
    // Local plugin: patches fmt so the iOS native build compiles under Xcode 26.
    "./plugins/withFmtXcode26Fix",
  ],
  extra: {
    eas: {
      projectId: "01fb7c7c-c6ae-4c8e-9f9e-03a01a001b08",
    },
    privacyPolicyUrl:
      "https://github.com/hud-code/binqr-mobile/blob/main/PRIVACY.md",
  },
});
