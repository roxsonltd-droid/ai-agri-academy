import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { theme } from "../lib/theme";

export default function RootLayout() {
	return (
		<LanguageProvider>
			<AuthProvider>
				<Stack
					screenOptions={{
						headerStyle: { backgroundColor: theme.bg },
						headerShadowVisible: false,
						headerTintColor: theme.forest,
						headerTitleStyle: { fontWeight: "600", fontSize: 17 },
						contentStyle: { backgroundColor: theme.bg },
					}}
				>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="welcome" options={{ headerShown: false }} />
					<Stack.Screen name="onboarding" />
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="login" />
					<Stack.Screen name="academy/[slug]" />
				</Stack>
			</AuthProvider>
		</LanguageProvider>
	);
}
