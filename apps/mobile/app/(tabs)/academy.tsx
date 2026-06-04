import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { fetchCoursesFromNext } from "../../lib/api";
import { lectureProgressPercent, loadAcademyProgress, type ProgressMap } from "../../lib/academyProgress";
import { COURSES, type CourseRow } from "../../lib/courses";
import { getCourseCatalogCached } from "../../lib/courseCatalogCache";
import { moduleLine, strings } from "../../lib/strings";
import { theme } from "../../lib/theme";

export default function AcademyTabScreen() {
	const { locale } = useLanguage();
	const s = strings(locale);
	const { token, ready } = useAuth();
	const [rows, setRows] = useState<CourseRow[]>([]);
	const [progress, setProgress] = useState<ProgressMap>({});
	const [loading, setLoading] = useState(true);
	const [fromOffline, setFromOffline] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setError(null);
		setLoading(true);
		const cacheKey = token ?? "anon";
		const p = await loadAcademyProgress();
		setProgress(p);
		try {
			const data = await getCourseCatalogCached(cacheKey, () => fetchCoursesFromNext(token));
			setRows(data);
			setFromOffline(false);
		} catch (e) {
			setRows(COURSES);
			setFromOffline(true);
			setError(e instanceof Error ? e.message : "error");
		} finally {
			setLoading(false);
		}
	}, [token]);

	useFocusEffect(
		useCallback(() => {
			if (!ready) return;
			void load();
		}, [ready, load]),
	);

	if (!ready) {
		return (
			<View style={styles.screen}>
				<View style={styles.center}>
					<ActivityIndicator size="large" color={theme.forest} />
				</View>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<FlatList
				data={rows}
				keyExtractor={(item) => item.slug}
				contentContainerStyle={styles.list}
				refreshing={loading}
				onRefresh={() => void load()}
				ListHeaderComponent={
					<View style={styles.headerBlock}>
						<Text style={styles.kicker}>{s.academy.kicker}</Text>
						<Text style={styles.heading}>{s.academy.heading}</Text>
						<Text style={styles.intro}>{s.academy.intro}</Text>
						{fromOffline && <Text style={styles.banner}>{s.academy.offlineHint}</Text>}
						{error && fromOffline && (
							<Text style={styles.errSmall}>
								{s.academy.errorTitle}: {error}
							</Text>
						)}
						<Text style={styles.sectionTitle}>{s.academy.coursesTitle}</Text>
					</View>
				}
				ListFooterComponent={
					error && !fromOffline ? (
						<Pressable style={styles.retry} onPress={() => void load()}>
							<Text style={styles.retryText}>{s.academy.retry}</Text>
						</Pressable>
					) : null
				}
				renderItem={({ item }) => (
					<CourseCard
						course={item}
						locale={locale}
						openLabel={s.academy.openCourse}
						progressLabel={s.academy.progressLabel}
						pct={lectureProgressPercent(item, progress[item.slug]?.completed ?? [])}
					/>
				)}
				ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
			/>
		</View>
	);
}

function CourseCard({
	course,
	locale,
	openLabel,
	progressLabel,
	pct,
}: {
	course: CourseRow;
	locale: "en" | "bg";
	openLabel: string;
	progressLabel: string;
	pct: number;
}) {
	const title = locale === "bg" ? course.title.bg : course.title.en;
	const desc = locale === "bg" ? course.description.bg : course.description.en;
	const mod = moduleLine(locale, course.modules);

	return (
		<Link href={`/academy/${course.slug}`} asChild>
			<Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
				<View style={styles.cardTop}>
					<Text style={styles.cardTitle}>{title}</Text>
					{pct > 0 ? (
						<Text style={styles.pctPill}>{progressLabel.replace("{{pct}}", String(pct))}</Text>
					) : null}
				</View>
				<Text style={styles.cardMeta}>{mod}</Text>
				<Text style={styles.cardDesc}>{desc}</Text>
				<Text style={styles.cardCta}>{openLabel} →</Text>
			</Pressable>
		</Link>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: theme.bg },
	center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
	list: { paddingHorizontal: 20, paddingBottom: 32 },
	headerBlock: { paddingTop: 8, paddingBottom: 8 },
	kicker: {
		fontSize: 12,
		fontWeight: "700",
		color: theme.forest,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	heading: {
		marginTop: 8,
		fontSize: 28,
		fontWeight: "700",
		color: theme.ink,
	},
	intro: {
		marginTop: 10,
		fontSize: 15,
		lineHeight: 22,
		color: theme.muted2,
	},
	banner: {
		marginTop: 12,
		padding: 10,
		borderRadius: 10,
		backgroundColor: theme.warningBg,
		color: theme.warningInk,
		fontSize: 13,
		lineHeight: 18,
	},
	errSmall: { marginTop: 8, fontSize: 12, color: "#b45309" },
	sectionTitle: {
		marginTop: 22,
		fontSize: 17,
		fontWeight: "700",
		color: theme.ink,
	},
	card: {
		backgroundColor: theme.bgCard,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: theme.border,
	},
	cardPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
	cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
	cardTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: theme.ink },
	pctPill: {
		fontSize: 11,
		fontWeight: "800",
		color: theme.forest,
		backgroundColor: theme.accentSoft,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	cardMeta: { marginTop: 4, fontSize: 13, fontWeight: "600", color: theme.forest },
	cardDesc: { marginTop: 8, fontSize: 14, lineHeight: 20, color: theme.muted2 },
	cardCta: { marginTop: 12, fontSize: 14, fontWeight: "700", color: theme.forest },
	retry: {
		marginHorizontal: 0,
		marginBottom: 8,
		padding: 12,
		alignItems: "center",
		borderRadius: 12,
		backgroundColor: theme.forest,
	},
	retryText: { color: "#fff", fontWeight: "700" },
});
