"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { loadProgressStore, completionRatio } from "@/lib/course-progress";

type Row = { slug: string; title: string; lectureIds: string[] };

export function AcademyHubProgress({
	courses,
	title,
}: {
	courses: Row[];
	title: string;
}) {
	const [, setTick] = useState(0);

	useEffect(() => {
		const fn = () => setTick((t) => t + 1);
		window.addEventListener("agrinexus-progress", fn);
		window.addEventListener("storage", fn);
		return () => {
			window.removeEventListener("agrinexus-progress", fn);
			window.removeEventListener("storage", fn);
		};
	}, []);

	const store = loadProgressStore();
	const rows = courses.map((c) => ({
		...c,
		pct: completionRatio(c.lectureIds, store[c.slug]),
		quiz: store[c.slug]?.lastQuizScore,
	}));

	return (
		<section className="mt-12 rounded-2xl border border-slate-200/90 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 sm:p-8">
			<h2 className="font-serif text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
			<ul className="mt-5 space-y-3">
				{rows.map((r) => (
					<li key={r.slug}>
						<Link
							href={`/academy/course/${r.slug}`}
							className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 transition hover:border-emerald-300/80 hover:shadow-md dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-emerald-500/30"
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-200/90 bg-emerald-50 text-xs font-bold text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-100">
								{r.pct}%
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-slate-900 dark:text-slate-100">{r.title}</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									{r.quiz != null ? `Quiz: ${r.quiz}%` : "Quiz: —"}
								</p>
							</div>
							<span className="text-slate-400 dark:text-slate-500">→</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
