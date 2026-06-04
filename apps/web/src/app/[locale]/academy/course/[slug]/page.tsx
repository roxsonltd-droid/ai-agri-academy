import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { COURSES, courseBySlug } from "@/content/academy-courses";
import { getFinalTest } from "@/content/final-course-tests";
import { CourseLearningPanel } from "@/components/academy/course-learning-panel";
import { AcademyRagDebatePanel } from "@/components/academy/academy-rag-debate-panel";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
	return routing.locales.flatMap((locale) => COURSES.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: Props) {
	const { locale, slug } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "Course" });
	const course = courseBySlug(slug, locale as AppLocale);
	if (!course) return { title: t("metaFallback") };
	return { title: `${course.title} · AgriNexus` };
}

export default async function CoursePage({ params }: Props) {
	const { locale, slug } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Course");
	const course = courseBySlug(slug, locale as AppLocale);
	if (!course) notFound();
	const hasFinalTest = getFinalTest(slug) !== undefined;

	return (
		<main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
			<p className="text-sm font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300">{t("kicker")}</p>
			<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{course.title}</h1>
			<p className="mt-3 text-slate-600 dark:text-slate-300">{course.description}</p>
			<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
				{t("modulesHint", { count: course.modules, slug })}
			</p>

			<CourseLearningPanel
				slug={slug}
				lectures={course.lectures.map((l) => ({ id: l.id, title: l.title }))}
				hasFinalTest={hasFinalTest}
				labels={{
					progress: t("panelProgress"),
					modules: t("panelModules"),
					openQuiz: t("panelOpenQuiz"),
					markDone: t("panelMarkDone"),
					lecturerLink: t("openLecturer"),
				}}
			/>

			<AcademyRagDebatePanel
				slug={slug}
				labels={{
					title: t("ragTitle"),
					subtitle: t("ragSubtitle"),
					placeholder: t("ragPlaceholder"),
					askRag: t("ragAsk"),
					deepDebate: t("ragDeep"),
					busyRag: t("ragBusyRag"),
					busyDebate: t("ragBusyDebate"),
					sources: t("ragSources"),
					errorPrefix: t("ragError"),
					hintBackend: t("ragHintBackend"),
				}}
			/>

			<ol className="mt-8 list-decimal space-y-3 pl-6 text-slate-800 dark:text-slate-200">
				{course.lectures.map((lec, i) => (
					<li key={lec.id} className="pl-1">
						<p className="font-medium text-slate-900">
							{i + 1}. {lec.title}
						</p>
						<p className="mt-1 text-sm text-slate-600">{lec.summary}</p>
						<Link
							href={`/academy/lecturer?focus=${encodeURIComponent(lec.id)}`}
							className="mt-2 inline-block text-sm font-medium text-emerald-800 underline underline-offset-4 dark:text-emerald-300"
						>
							{t("openLecturer")}
						</Link>
					</li>
				))}
			</ol>

			{hasFinalTest ? (
				<Link
					href={`/academy/course/${slug}/test`}
					className="mt-8 flex items-center justify-between gap-4 rounded-2xl border-2 border-amber-500/80 bg-amber-50 px-5 py-4 text-amber-950 shadow-sm transition-colors hover:bg-amber-100/90 dark:border-amber-400/50 dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-900/50"
				>
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-amber-900">{t("finalTestEyebrow")}</p>
						<p className="font-semibold">{t("finalTestTitle")}</p>
						<p className="mt-1 text-sm text-amber-900/90">{t("finalTestSub")}</p>
					</div>
					<span className="text-2xl" aria-hidden>
						→
					</span>
				</Link>
			) : null}

			<p className="mt-10 flex flex-wrap gap-4 text-sm">
				<Link href="/academy" className="text-emerald-800 underline underline-offset-4">
					{t("backCourses")}
				</Link>
				<Link href="/academy/lecturer" className="text-emerald-800 underline underline-offset-4">
					{t("lecturerPicker")}
				</Link>
			</p>
		</main>
	);
}
