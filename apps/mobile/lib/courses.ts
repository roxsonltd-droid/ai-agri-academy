/**
 * Офлайн каталог за мобилното приложение — синхронизира се от `content/academy`
 * чрез `npm run sync:academy` (копира `academy.catalog.json` тук).
 */
import catalog from "./academy.catalog.json";

export type Localized = { en: string; bg: string };

export type LectureRow = {
	id: string;
	title: Localized;
	summary: Localized;
};

export type CourseRow = {
	slug: string;
	modules: number;
	title: Localized;
	description: Localized;
	lectures: LectureRow[];
};

type Loc = { bg: string; en: string };

type CatLec = {
	id: string;
	title: Loc;
	summary: Loc;
};

type CatCourse = {
	slug: string;
	modules: number;
	title: Loc;
	description: Loc;
	lectures: CatLec[];
};

function mapCourse(c: CatCourse): CourseRow {
	return {
		slug: c.slug,
		modules: c.modules,
		title: { bg: c.title.bg, en: c.title.en },
		description: { bg: c.description.bg, en: c.description.en },
		lectures: c.lectures.map((l) => ({
			id: l.id,
			title: { bg: l.title.bg, en: l.title.en },
			summary: { bg: l.summary.bg, en: l.summary.en },
		})),
	};
}

const rows = (catalog as { courses: CatCourse[] }).courses;

export const COURSES: CourseRow[] = rows.map(mapCourse);

export function courseBySlug(slug: string): CourseRow | undefined {
	return COURSES.find((c) => c.slug === slug);
}
