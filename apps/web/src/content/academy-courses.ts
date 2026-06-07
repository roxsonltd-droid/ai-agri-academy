/**
 * Курсове и лекции за AgriNexus Academy (Next).
 * Каталогът се генерира от `content/academy` чрез `npm run sync:academy` → `academy.catalog.json`.
 * Markdown телата живеят в `public/lectures/` (копие от content при sync).
 */
import type { AppLocale } from "@/i18n/routing";
import catalog from "./academy.catalog.json";

export type LectureRef = {
	id: string;
	title: string;
	summary: string;
	/** път под public/lectures/, напр. courses/soil-fertility/01-probi.md */
	file: string;
};

export type Course = {
	slug: string;
	title: string;
	description: string;
	modules: number;
	lectures: LectureRef[];
};

type Localized = { bg: string; en: string };

type CatalogLecture = {
	id: string;
	file: string;
	filename: string;
	title: Localized;
	summary: Localized;
};

type CatalogCourse = {
	slug: string;
	modules: number;
	title: Localized;
	description: Localized;
	lectures: CatalogLecture[];
};

const catalogCourses = catalog.courses as CatalogCourse[];

function toCourseBg(c: CatalogCourse): Course {
	return {
		slug: c.slug,
		title: c.title.bg,
		description: c.description.bg,
		modules: c.modules,
		lectures: c.lectures.map((l) => ({
			id: l.id,
			title: l.title.bg,
			summary: l.summary.bg,
			file: l.file,
		})),
	};
}

export const COURSES: Course[] = catalogCourses.map(toCourseBg);

/** Плосък списък за компонента „Лектор“ (dropdown). */
export type LectureMeta = LectureRef & {
	courseSlug: string;
	courseTitle: string;
};

function localizeCourse(course: Course, locale: AppLocale): Course {
	if (locale === "bg") return course;
	const c = catalogCourses.find((x) => x.slug === course.slug);
	if (!c) return course;
	return {
		slug: c.slug,
		title: c.title.en,
		description: c.description.en,
		modules: c.modules,
		lectures: course.lectures.map((l) => {
			const src = c.lectures.find((x) => x.id === l.id);
			return src ? { ...l, title: src.title.en, summary: src.summary.en } : l;
		}),
	};
}

export function coursesForLocale(locale: AppLocale): Course[] {
	return COURSES.map((c) => localizeCourse(c, locale));
}

export function courseBySlug(slug: string, locale: AppLocale = "bg"): Course | undefined {
	const c = COURSES.find((x) => x.slug === slug);
	return c ? localizeCourse(c, locale) : undefined;
}

export function allLecturesForLocale(locale: AppLocale): LectureMeta[] {
	return coursesForLocale(locale).flatMap((c) =>
		c.lectures.map((l) => ({
			...l,
			courseSlug: c.slug,
			courseTitle: c.title,
		})),
	);
}

/** @deprecated Prefer `allLecturesForLocale("bg")` — kept for older imports. */
export const ALL_LECTURES: LectureMeta[] = allLecturesForLocale("bg");

export function lectureMetaById(id: string, locale: AppLocale = "bg"): LectureMeta | undefined {
	return allLecturesForLocale(locale).find((l) => l.id === id);
}

export function lectureById(id: string): LectureMeta | undefined {
	return lectureMetaById(id, "bg");
}
