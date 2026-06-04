import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { fetchCoursesFromNext } from "../../lib/api";
import { lectureProgressPercent, loadAcademyProgress, type ProgressMap } from "../../lib/academyProgress";
import { getCourseCatalogCached } from "../../lib/courseCatalogCache";
import { COURSES, type CourseRow } from "../../lib/courses";
import { strings } from "../../lib/strings";
import { theme } from "../../lib/theme";

export default function DashboardScreen() {
	const { locale } = useLanguage();
	const s = strings(locale);
	const d = s.dashboard;
	const router = useRouter();
	const { email, ready, signOut, token } = useAuth();
	const [progress, setProgress] = useState<ProgressMap>({});
	const [courses, setCourses] = useState<CourseRow[]>([]);
	const [loadingCont, setLoadingCont] = useState(true);

	const displayName = email?.split("@")[0] ?? d.guestName;

	const loadContinue = useCallback(async () => {
		setLoadingCont(true);
		const [p, cacheKey] = await Promise.all([loadAcademyProgress(), Promise.resolve(token ?? "anon")]);
		setProgress(p);
		try {
			const list = await getCourseCatalogCached(cacheKey, () => fetchCoursesFromNext(token));
			setCourses(list);
		} catch {
			setCourses(COURSES);
		} finally {
			setLoadingCont(false);
		}
	}, [token]);

	useFocusEffect(
		useCallback(() => {
			if (!ready) return;
			void loadContinue();
		}, [ready, loadContinue]),
	);

	const continueCourse = useMemo(() => {
		let best: { course: CourseRow; pct: number } | null = null;
		for (const c of courses.length ? courses : COURSES) {
			const done = progress[c.slug]?.completed ?? [];
			const pct = lectureProgressPercent(c, done);
			if (pct > 0 && pct < 100) {
				if (!best || pct > best.pct) best = { course: c, pct };
			}
		}
		if (best) return best;
		const first = (courses.length ? courses : COURSES)[0];
		if (!first) return null;
		const pct = lectureProgressPercent(first, progress[first.slug]?.completed ?? []);
		return { course: first, pct };
	}, [courses, progress]);

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
			<Text style={styles.kicker}>AgriNexus</Text>
			<Text style={styles.greeting}>
				{d.greeting}, {displayName}
			</Text>
			<Text style={styles.tagline}>{d.tagline}</Text>
			{ready && email ? (
				<Text style={styles.session}>{s.home.signedInAs.replace("{{email}}", email)}</Text>
			) : (
				<Text style={styles.sessionMuted}>{s.home.subtitle}</Text>
			)}

			<View style={styles.row2}>
				<Pressable
					style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
					onPress={() => router.push("/tutor")}
				>
					<Text style={styles.tileTitle}>{d.quickTutor}</Text>
					<Text style={styles.tileSub}>{d.quickTutorSub}</Text>
				</Pressable>
				<Pressable
					style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
					onPress={() => router.push("/academy")}
				>
					<Text style={styles.tileTitle}>{d.quickAcademy}</Text>
					<Text style={styles.tileSub}>{d.quickAcademySub}</Text>
				</Pressable>
			</View>

			<Text style={styles.sectionTitle}>{d.continueTitle}</Text>
			{!ready || loadingCont ? (
				<View style={styles.continueBox}>
					<ActivityIndicator color={theme.forest} />
				</View>
			) : continueCourse ? (
				<Pressable
					style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}
					onPress={() => router.push(`/academy/${continueCourse.course.slug}`)}
				>
					<View style={styles.continueTop}>
						<Text style={styles.continueTitle}>
							{locale === "bg" ? continueCourse.course.title.bg : continueCourse.course.title.en}
						</Text>
						<Text style={styles.pctBadge}>
							{s.academy.progressLabel.replace("{{pct}}", String(continueCourse.pct))}
						</Text>
					</View>
					<Text style={styles.continueCta}>{d.openCourse} →</Text>
				</Pressable>
			) : (
				<View style={styles.continueBox}>
					<Text style={styles.continueEmpty}>{d.continueEmpty}</Text>
				</View>
			)}

			<Text style={styles.hint}>{d.statsHint}</Text>

			<View style={styles.footerActions}>
				{ready && !email ? (
					<Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => router.push("/login")}>
						<Text style={styles.primaryLabel}>{s.home.login}</Text>
					</Pressable>
				) : null}
				{ready && email ? (
					<Pressable
						style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
						onPress={() => void signOut()}
					>
						<Text style={styles.ghostLabel}>{s.home.signOut}</Text>
					</Pressable>
				) : null}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: theme.bg },
	content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
	kicker: {
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 1.2,
		color: theme.forest,
		textTransform: "uppercase",
	},
	greeting: { marginTop: 8, fontSize: 26, fontWeight: "800", color: theme.ink },
	tagline: { marginTop: 8, fontSize: 15, lineHeight: 22, color: theme.muted2 },
	session: { marginTop: 10, fontSize: 14, fontWeight: "600", color: theme.forest },
	sessionMuted: { marginTop: 10, fontSize: 14, color: theme.muted },
	row2: { flexDirection: "row", gap: 12, marginTop: 22 },
	tile: {
		flex: 1,
		backgroundColor: theme.bgCard,
		borderRadius: 16,
		padding: 14,
		borderWidth: 1,
		borderColor: theme.border,
		minHeight: 100,
	},
	tileTitle: { fontSize: 16, fontWeight: "800", color: theme.ink },
	tileSub: { marginTop: 6, fontSize: 13, lineHeight: 18, color: theme.muted },
	sectionTitle: { marginTop: 28, fontSize: 17, fontWeight: "800", color: theme.ink },
	continueBox: {
		marginTop: 12,
		padding: 18,
		borderRadius: 16,
		backgroundColor: theme.accentSoft,
		alignItems: "center",
	},
	continueCard: {
		marginTop: 12,
		padding: 16,
		borderRadius: 16,
		backgroundColor: theme.bgCard,
		borderWidth: 1,
		borderColor: theme.border,
	},
	continueTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
	continueTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: theme.ink },
	pctBadge: {
		fontSize: 12,
		fontWeight: "800",
		color: theme.forest,
		backgroundColor: theme.accentSoft,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	continueCta: { marginTop: 12, fontSize: 14, fontWeight: "700", color: theme.forest },
	continueEmpty: { fontSize: 14, lineHeight: 20, color: theme.muted2, textAlign: "center" },
	hint: { marginTop: 20, fontSize: 12, lineHeight: 17, color: theme.muted },
	footerActions: { marginTop: 20, gap: 10 },
	primaryBtn: {
		backgroundColor: theme.forest,
		paddingVertical: 14,
		borderRadius: 14,
		alignItems: "center",
	},
	primaryLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
	ghostBtn: {
		paddingVertical: 12,
		borderRadius: 14,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(10,10,10,0.15)",
	},
	ghostLabel: { color: theme.muted2, fontSize: 15, fontWeight: "600" },
	pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
