/** Client-side course progress + quiz scores (localStorage). Sync to Supabase later if needed. */

const STORAGE_KEY = "agrinexus_academy_progress_v1";

export type LectureProgress = { id: string; done: boolean; lastViewed?: string };
export type CourseProgress = {
	slug: string;
	lectures: Record<string, LectureProgress>;
	lastQuizScore?: number;
	lastQuizAt?: string;
	updatedAt: string;
};

export type ProgressStore = Record<string, CourseProgress>;

export function loadProgressStore(): ProgressStore {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as ProgressStore;
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}

export function saveProgressStore(store: ProgressStore) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	window.dispatchEvent(new Event("agrinexus-progress"));
}

export function getCourseProgress(slug: string): CourseProgress | undefined {
	return loadProgressStore()[slug];
}

export function setLectureDone(slug: string, lectureId: string, lectureIds: string[]) {
	const store = loadProgressStore();
	const prev = store[slug] ?? {
		slug,
		lectures: {},
		updatedAt: new Date().toISOString(),
	};
	const lectures = { ...prev.lectures, [lectureId]: { id: lectureId, done: true, lastViewed: new Date().toISOString() } };
	store[slug] = { ...prev, lectures, updatedAt: new Date().toISOString() };
	saveProgressStore(store);
	return completionRatio(lectureIds, store[slug]);
}

export function completionRatio(lectureIds: string[], course?: CourseProgress): number {
	if (!lectureIds.length) return 0;
	const done = lectureIds.filter((id) => course?.lectures[id]?.done).length;
	return Math.round((done / lectureIds.length) * 100);
}

export function saveQuizScore(slug: string, scorePercent: number) {
	const store = loadProgressStore();
	const prev = store[slug] ?? { slug, lectures: {}, updatedAt: new Date().toISOString() };
	store[slug] = {
		...prev,
		lastQuizScore: scorePercent,
		lastQuizAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
	saveProgressStore(store);
}
