import { Stack, router } from "expo-router";
import { Fragment, useState } from "react";
import { LangToggle } from "../components/LangToggle";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { isMobileOnboardingComplete, setWelcomeSeen } from "../lib/mobileFarmProfile";
import { strings } from "../lib/strings";
import { theme } from "../lib/theme";

export default function WelcomeScreen() {
	const { locale } = useLanguage();
	const s = strings(locale);
	const w = s.welcome;
	const { token } = useAuth();
	const [busy, setBusy] = useState(false);

	async function onContinue() {
		if (busy) return;
		setBusy(true);
		try {
			await setWelcomeSeen();
			if (token && !(await isMobileOnboardingComplete())) {
				router.replace("/onboarding");
			} else {
				router.replace("/(tabs)");
			}
		} finally {
			setBusy(false);
		}
	}

	async function goLogin() {
		await setWelcomeSeen();
		router.push("/login");
	}

	return (
		<Fragment>
			<Stack.Screen options={{ title: w.title, headerRight: () => <LangToggle /> }} />
			<ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
				<Text style={styles.kicker}>{w.kicker}</Text>
				<Text style={styles.title}>{w.headline}</Text>
				<Text style={styles.lead}>{w.lead}</Text>
				<View style={styles.bullets}>
					<Text style={styles.bullet}>• {w.b1}</Text>
					<Text style={styles.bullet}>• {w.b2}</Text>
					<Text style={styles.bullet}>• {w.b3}</Text>
				</View>
				<Pressable
					style={({ pressed }) => [styles.cta, (pressed || busy) && styles.pressed]}
					onPress={() => void onContinue()}
					disabled={busy}
				>
					<Text style={styles.ctaLabel}>{w.cta}</Text>
				</Pressable>
				<Pressable style={styles.secondary} onPress={() => void goLogin()}>
					<Text style={styles.secondaryLabel}>{w.hasAccount}</Text>
				</Pressable>
			</ScrollView>
		</Fragment>
	);
}

const styles = StyleSheet.create({
	scroll: {
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 48,
		backgroundColor: theme.bg,
		flexGrow: 1,
	},
	kicker: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.forest,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	title: { marginTop: 12, fontSize: 28, fontWeight: "800", color: theme.ink, lineHeight: 34 },
	lead: { marginTop: 12, fontSize: 16, lineHeight: 24, color: theme.muted2 },
	bullets: { marginTop: 24, gap: 10 },
	bullet: { fontSize: 15, lineHeight: 22, color: theme.ink },
	cta: {
		marginTop: 32,
		backgroundColor: theme.forest,
		borderRadius: 14,
		paddingVertical: 16,
		alignItems: "center",
	},
	ctaLabel: { color: "#fff", fontSize: 16, fontWeight: "800" },
	pressed: { opacity: 0.88 },
	secondary: { marginTop: 16, alignSelf: "center", paddingVertical: 8 },
	secondaryLabel: { fontSize: 15, color: theme.forest, fontWeight: "700", textDecorationLine: "underline" },
});
