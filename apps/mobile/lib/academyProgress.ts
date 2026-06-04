import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CourseRow } from "./courses";

const KEY = "agrinexus_mobile_academy_progress_v1";

export type ProgressMap = Record<string, { completed: string[] }>;

export async function loadAcademyProgress(): Promise<ProgressMap> {
	try {
		const raw = await AsyncStorage.getItem(KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== "object" || parsed === null) return {};
		return parsed as ProgressMap;
	} catch {
		return {};
	}
}

export async function saveAcademyProgress(m: ProgressMap): Promise<void> {
	await AsyncStorage.setItem(KEY, JSON.stringify(m));
}

export async function toggleLectureComplete(slug: string, lectureId: string): Promise<ProgressMap> {
	const m = await loadAcademyProgress();
	const prev = m[slug]?.completed ?? [];
	const set = new Set(prev);
	if (set.has(lectureId)) set.delete(lectureId);
	else set.add(lectureId);
	m[slug] = { completed: Array.from(set) };
	await saveAcademyProgress(m);
	return m;
}

export function lectureProgressPercent(course: CourseRow, completedIds: string[]): number {
	const n = course.lectures.length;
	if (n === 0) return 0;
	const done = course.lectures.filter((l) => completedIds.includes(l.id)).length;
	return Math.round((done / n) * 100);
}
