import { Stack, router } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { LangToggle } from "../components/LangToggle";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { saveMobileFarmProfile } from "../lib/mobileFarmProfile";
import { strings } from "../lib/strings";
import { theme } from "../lib/theme";

const CULTURES = [
	"Пшеница",
	"Царевица",
	"Слънчоглед",
	"Ечемик",
	"Рапица",
	"Домати",
	"Лозя",
];

const REGIONS_BG = [
	"Северозападен",
	"Северен централен",
	"Североизточен",
	"Югоизточен",
	"Южен централен",
	"Югозападен",
];

export default function MobileOnboardingScreen() {
	const { locale } = useLanguage();
	const s = strings(locale);
	const o = s.mobOnboarding;
	const { token, ready } = useAuth();
	const [step, setStep] = useState(0);
	const [cultures, setCultures] = useState<string[]>([]);
	const [region, setRegion] = useState("");
	const [totalHa, setTotalHa] = useState("");
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState("");

	useEffect(() => {
		if (ready && !token) router.replace("/login");
	}, [ready, token]);

	const toggle = (c: string) => {
		setCultures((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
	};

	const canNext = step === 0 ? cultures.length > 0 : region.length > 0 && totalHa.trim() !== "" && !Number.isNaN(Number(totalHa));

	async function finish() {
		if (!canNext || !token) {
			setErr(o.error);
			return;
		}
		setErr("");
		setBusy(true);
		try {
			await saveMobileFarmProfile({
				cultures,
				region,
				totalHa: Number(totalHa),
				experience: "intermediate",
			});
			router.replace("/(tabs)");
		} finally {
			setBusy(false);
		}
	}

	if (!ready || !token) {
		return (
			<View style={styles.center}>
				<ActivityIndicator color={theme.forest} />
			</View>
		);
	}

	return (
		<Fragment>
			<Stack.Screen options={{ title: o.title, headerRight: () => <LangToggle /> }} />
			<ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
				<Text style={styles.kicker}>{o.kicker}</Text>
				<Text style={styles.title}>{step === 0 ? o.step1Title : o.step2Title}</Text>
				{step === 0 ? <Text style={styles.hint}>{o.step1Hint}</Text> : null}

				{step === 0 ? (
					<View style={styles.chips}>
						{CULTURES.map((c) => (
							<Pressable
								key={c}
								onPress={() => toggle(c)}
								style={({ pressed }) => [
									styles.chip,
									cultures.includes(c) && styles.chipOn,
									pressed && styles.pressed,
								]}
							>
								<Text style={[styles.chipText, cultures.includes(c) && styles.chipTextOn]}>{c}</Text>
							</Pressable>
						))}
					</View>
				) : (
					<View style={styles.form}>
						<Text style={styles.label}>{o.regionLabel}</Text>
						<View style={styles.chips}>
							{REGIONS_BG.map((r) => (
								<Pressable
									key={r}
									onPress={() => setRegion(r)}
									style={({ pressed }) => [styles.chip, region === r && styles.chipOn, pressed && styles.pressed]}
								>
									<Text style={[styles.chipText, region === r && styles.chipTextOn]}>{r}</Text>
								</Pressable>
							))}
						</View>
						<Text style={[styles.label, { marginTop: 16 }]}>{o.haLabel}</Text>
						<TextInput
							value={totalHa}
							onChangeText={setTotalHa}
							keyboardType="decimal-pad"
							placeholder={o.haPlaceholder}
							placeholderTextColor={theme.muted}
							style={styles.input}
						/>
					</View>
				)}

				{err ? <Text style={styles.err}>{err}</Text> : null}

				<View style={styles.row}>
					{step > 0 ? (
						<Pressable style={styles.secondaryBtn} onPress={() => setStep(0)}>
							<Text style={styles.secondaryLabel}>{o.back}</Text>
						</Pressable>
					) : (
						<View style={styles.spacer} />
					)}
					{step === 0 ? (
						<Pressable
							style={[styles.primaryBtn, !canNext && styles.disabled]}
							disabled={!canNext}
							onPress={() => setStep(1)}
						>
							<Text style={styles.primaryLabel}>{o.next}</Text>
						</Pressable>
					) : (
						<Pressable
							style={[styles.primaryBtn, (!canNext || busy) && styles.disabled]}
							disabled={!canNext || busy}
							onPress={() => void finish()}
						>
							{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryLabel}>{o.finish}</Text>}
						</Pressable>
					)}
				</View>
			</ScrollView>
		</Fragment>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg },
	scroll: { padding: 20, paddingBottom: 40, backgroundColor: theme.bg, flexGrow: 1 },
	kicker: { fontSize: 11, fontWeight: "800", color: theme.forest, letterSpacing: 1 },
	title: { marginTop: 8, fontSize: 22, fontWeight: "800", color: theme.ink },
	hint: { marginTop: 6, fontSize: 14, color: theme.muted2 },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
	chip: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: theme.border,
		backgroundColor: theme.bgCard,
	},
	chipOn: { borderColor: theme.forest, backgroundColor: "rgba(20,83,45,0.12)" },
	chipText: { fontSize: 14, color: theme.ink, fontWeight: "600" },
	chipTextOn: { color: theme.forest },
	pressed: { opacity: 0.9 },
	form: { marginTop: 8 },
	label: { fontSize: 14, fontWeight: "700", color: theme.ink },
	input: {
		marginTop: 8,
		borderWidth: 1,
		borderColor: theme.border,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		color: theme.ink,
		backgroundColor: theme.bgCard,
	},
	err: { marginTop: 12, color: "#b91c1c", fontSize: 14 },
	row: {
		marginTop: 28,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	spacer: { flex: 1 },
	primaryBtn: {
		flex: 1,
		backgroundColor: theme.forest,
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: "center",
	},
	primaryLabel: { color: "#fff", fontWeight: "800", fontSize: 15 },
	secondaryBtn: { paddingVertical: 12, paddingHorizontal: 8 },
	secondaryLabel: { color: theme.forest, fontWeight: "700", fontSize: 15 },
	disabled: { opacity: 0.45 },
});
