import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "BinQR",
  slug: "binqr",
  version: "1.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
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
      CFBundleDisplayName: "BinQR"
    }
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
        cameraPermission: "Allow BinQR to access your camera to scan QR codes."
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow BinQR to access your photos to select images."
      }
    ]
  ],
}); 