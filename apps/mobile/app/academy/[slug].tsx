import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { LangToggle } from "../../components/LangToggle";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { fetchCoursesFromNext } from "../../lib/api";
import {
	lectureProgressPercent,
	loadAcademyProgress,
	toggleLectureComplete,
} from "../../lib/academyProgress";
import { courseBySlug, type CourseRow } from "../../lib/courses";
import { getCourseCatalogCached } from "../../lib/courseCatalogCache";
import { moduleLine, strings } from "../../lib/strings";
import { theme } from "../../lib/theme";

export default function AcademyCourseScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const { locale } = useLanguage();
	const s = strings(locale);
	const { token, ready } = useAuth();
	const [course, setCourse] = useState<CourseRow | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [completedIds, setCompletedIds] = useState<string[]>([]);

	const slugStr = String(slug ?? "");

	const refreshProgress = useCallback(async () => {
		const map = await loadAcademyProgress();
		setCompletedIds(map[slugStr]?.completed ?? []);
	}, [slugStr]);

	const resolve = useCallback(async () => {
		setLoading(true);
		const cacheKey = token ?? "anon";
		try {
			const list = await getCourseCatalogCached(cacheKey, () => fetchCoursesFromNext(token));
			setCourse(list.find((c) => c.slug === slugStr));
		} catch {
			setCourse(courseBySlug(slugStr));
		} finally {
			setLoading(false);
		}
	}, [slugStr, token]);

	useEffect(() => {
		if (!ready) return;
		void resolve();
	}, [ready, resolve]);

	useFocusEffect(
		useCallback(() => {
			if (!ready || !slugStr) return;
			void refreshProgress();
		}, [ready, slugStr, refreshProgress]),
	);

	if (!ready || loading) {
		return (
			<View style={styles.center}>
				<Stack.Screen
					options={{
						title: s.academy.header,
						headerRight: () => <LangToggle />,
					}}
				/>
				<ActivityIndicator size="large" color={theme.forest} />
			</View>
		);
	}

	if (!course) {
		return (
			<View style={styles.center}>
				<Stack.Screen
					options={{
						title: s.academy.notFound,
						headerRight: () => <LangToggle />,
					}}
				/>
				<Text style={styles.notFoundTitle}>{s.academy.notFound}</Text>
				<Link href="/academy" asChild>
					<Pressable style={styles.linkBtn}>
						<Text style={styles.linkText}>{s.academy.backList}</Text>
					</Pressable>
				</Link>
			</View>
		);
	}

	const title = locale === "bg" ? course.title.bg : course.title.en;
	const desc = locale === "bg" ? course.description.bg : course.description.en;
	const pct = lectureProgressPercent(course, completedIds);

	async function onToggleLecture(lectureId: string) {
		const map = await toggleLectureComplete(slugStr, lectureId);
		setCompletedIds(map[slugStr]?.completed ?? []);
	}

	return (
		<ScrollView contentContainerStyle={styles.scroll} style={styles.flex}>
			<Stack.Screen
				options={{
					title,
					headerRight: () => <LangToggle />,
				}}
			/>
			<Text style={styles.kicker}>{s.academy.kicker}</Text>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.meta}>{moduleLine(locale, course.modules)}</Text>
			<Text style={styles.progressLine}>{s.academy.progressLabel.replace("{{pct}}", String(pct))}</Text>
			<Text style={styles.body}>{desc}</Text>
			<Text style={styles.section}>{s.academy.lectures}</Text>
			{course.lectures.map((lec) => {
				const lt = locale === "bg" ? lec.title.bg : lec.title.en;
				const sum = locale === "bg" ? lec.summary.bg : lec.summary.en;
				const done = completedIds.includes(lec.id);
				return (
					<Pressable
						key={lec.id}
						style={({ pressed }) => [styles.lecture, done && styles.lectureDone, pressed && styles.lecturePressed]}
						onPress={() => void onToggleLecture(lec.id)}
						accessibilityRole="checkbox"
						accessibilityState={{ checked: done }}
						accessibilityLabel={done ? s.academy.lectureUnmark : s.academy.lectureMark}
					>
						<View style={styles.lectureRow}>
							<Text style={styles.check}>{done ? "✓" : "○"}</Text>
							<View style={styles.lectureTextCol}>
								<Text style={styles.lectureTitle}>{lt}</Text>
								<Text style={styles.lectureSum}>{sum}</Text>
							</View>
						</View>
					</Pressable>
				);
			})}
			<Link href="/academy" asChild>
				<Pressable style={styles.backWrap}>
					<Text style={styles.back}>{s.academy.backList}</Text>
				</Pressable>
			</Link>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: theme.bg },
	scroll: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 40 },
	kicker: {
		fontSize: 11,
		fontWeight: "700",
		color: theme.forest,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	title: { marginTop: 6, fontSize: 24, fontWeight: "800", color: theme.ink },
	meta: { marginTop: 6, fontSize: 14, fontWeight: "600", color: theme.forest },
	progressLine: { marginTop: 4, fontSize: 13, fontWeight: "700", color: theme.muted2 },
	body: { marginTop: 12, fontSize: 15, lineHeight: 22, color: theme.muted2 },
	section: { marginTop: 22, fontSize: 16, fontWeight: "800", color: theme.ink },
	lecture: {
		marginTop: 12,
		padding: 14,
		borderRadius: 14,
		backgroundColor: theme.bgCard,
		borderWidth: 1,
		borderColor: theme.border,
	},
	lectureDone: { borderColor: theme.forest, backgroundColor: theme.accentSoft },
	lecturePressed: { opacity: 0.92 },
	lectureRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
	check: { fontSize: 18, fontWeight: "800", color: theme.forest, width: 22 },
	lectureTextCol: { flex: 1 },
	lectureTitle: { fontSize: 15, fontWeight: "700", color: theme.ink },
	lectureSum: { marginTop: 6, fontSize: 14, lineHeight: 20, color: theme.muted },
	backWrap: { marginTop: 28, alignSelf: "flex-start" },
	back: { fontSize: 15, fontWeight: "700", color: theme.forest },
	center: { flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: "center" },
	notFoundTitle: { fontSize: 18, fontWeight: "700", color: theme.ink },
	linkBtn: { marginTop: 16 },
	linkText: { fontSize: 15, color: theme.forest, fontWeight: "700" },
});
