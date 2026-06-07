import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getWelcomeSeen, isMobileOnboardingComplete } from "../lib/mobileFarmProfile";
import { theme } from "../lib/theme";

/**
 * Cold start: `/welcome` first launch → signed-in without profile → `/onboarding` → `/(tabs)`.
 */
export default function IndexGate() {
	const router = useRouter();
	const { ready, token } = useAuth();

	useEffect(() => {
		if (!ready) return;
		let cancelled = false;
		void (async () => {
			const seen = await getWelcomeSeen();
			if (cancelled) return;
			if (!seen) {
				router.replace("/welcome");
				return;
			}
			if (token && !(await isMobileOnboardingComplete())) {
				if (cancelled) return;
				router.replace("/onboarding");
				return;
			}
			if (cancelled) return;
			router.replace("/(tabs)");
		})();
		return () => {
			cancelled = true;
		};
	}, [ready, token, router]);

	return (
		<View style={styles.wrap}>
			<ActivityIndicator size="large" color={theme.forest} accessibilityLabel="Loading" />
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg },
});
