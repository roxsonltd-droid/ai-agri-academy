"use client";

import { useMemo, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Circle, GraduationCap, ClipboardCheck } from "lucide-react";
import { completionRatio, getCourseProgress, setLectureDone, type CourseProgress } from "@/lib/course-progress";

type Props = {
	slug: string;
	lectures: { id: string; title: string }[];
	hasFinalTest: boolean;
	labels: {
		progress: string;
		modules: string;
		openQuiz: string;
		markDone: string;
		lecturerLink: string;
	};
};

const R = 34;
const CIRC = 2 * Math.PI * R;

export function CourseLearningPanel({ slug, lectures, hasFinalTest, labels }: Props) {
	const ids = useMemo(() => lectures.map((l) => l.id), [lectures]);
	const [progress, setProgress] = useState<CourseProgress | undefined>(undefined);
	const [pct, setPct] = useState(0);

	useEffect(() => {
		const p = getCourseProgress(slug);
		setProgress(p);
		setPct(completionRatio(ids, p));
	}, [slug, ids]);

	const toggle = (lectureId: string) => {
		const r = setLectureDone(slug, lectureId, ids);
		setPct(r);
		setProgress(getCourseProgress(slug));
	};

	const dash = (pct / 100) * CIRC;

	return (
		<section className="mt-10 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm dark:border-white/10 dark:from-slate-900/80 dark:to-slate-950/80 sm:p-8">
			<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">{labels.progress}</p>
					<div className="mt-3 flex items-center gap-4">
						<div className="relative h-[88px] w-[88px] shrink-0">
							<svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0" aria-hidden>
								<circle cx="44" cy="44" r={R} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="8" />
								<circle
									cx="44"
									cy="44"
									r={R}
									fill="none"
									className="stroke-emerald-500 dark:stroke-emerald-400"
									strokeWidth="8"
									strokeLinecap="round"
									strokeDasharray={`${dash} ${CIRC}`}
									transform="rotate(-90 44 44)"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900 dark:text-slate-100">
								{pct}%
							</div>
						</div>
						<div>
							<p className="text-sm text-slate-600 dark:text-slate-400">{labels.modules}</p>
							<p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
								{ids.filter((id) => progress?.lectures[id]?.done).length}/{ids.length}
							</p>
						</div>
					</div>
				</div>
				{hasFinalTest ? (
					<Link
						href={`/academy/course/${slug}/test`}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-amber-950 shadow-md transition hover:bg-amber-400 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300"
					>
						<ClipboardCheck className="h-4 w-4" aria-hidden />
						{labels.openQuiz}
					</Link>
				) : null}
			</div>

			<ul className="mt-8 space-y-2">
				{lectures.map((lec, i) => {
					const done = !!progress?.lectures[lec.id]?.done;
					return (
						<li
							key={lec.id}
							className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50"
						>
							<button
								type="button"
								onClick={() => toggle(lec.id)}
								className="mt-0.5 text-emerald-600 transition hover:scale-105 dark:text-emerald-400"
								aria-pressed={done}
								title={labels.markDone}
							>
								{done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />}
							</button>
							<div className="min-w-0 flex-1">
								<p className="font-medium text-slate-900 dark:text-slate-100">
									{i + 1}. {lec.title}
								</p>
								<Link
									href={`/academy/lecturer?focus=${encodeURIComponent(lec.id)}`}
									className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-300"
								>
									<GraduationCap className="h-3.5 w-3.5" aria-hidden />
									{labels.lecturerLink}
								</Link>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
