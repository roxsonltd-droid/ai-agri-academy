import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "AI Agro Academy",
  slug: "ai-agro-academy-mobile",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "agroacademy",
  platforms: ["ios", "android"],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://agro-academy-backend.onrender.com",
  },
};

export default config;
