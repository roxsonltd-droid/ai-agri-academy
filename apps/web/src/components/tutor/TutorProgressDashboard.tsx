"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";

export type TutorTopicProgress = {
	topic: string;
	mastery_level?: number;
	attempts?: number;
	correct_answers?: number;
	last_assessed?: string | null;
};

export type TutorProgressPayload = {
	profile: Record<string, unknown> | null;
	topics: TutorTopicProgress[];
	computed_level: number;
};

export function TutorProgressDashboard({ userId }: { userId: string }) {
	const [data, setData] = useState<TutorProgressPayload | null>(null);
	const [err, setErr] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async () => {
		if (!userId.trim()) return;
		setLoading(true);
		setErr(null);
		try {
			const r = await fetch(`/api/tutor/progress?user_id=${encodeURIComponent(userId)}`);
			const j = await r.json();
			if (!r.ok) {
				setData(null);
				setErr(typeof j.detail === "string" ? j.detail : r.status === 404 ? "feature_disabled" : "load_failed");
				return;
			}
			setData(j as TutorProgressPayload);
		} catch {
			setErr("network");
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		const fn = () => void load();
		window.addEventListener("tutor-progress-refresh", fn);
		return () => window.removeEventListener("tutor-progress-refresh", fn);
	}, [load]);

	const cultures = data?.profile?.cultures;
	const cultureStr = Array.isArray(cultures) ? cultures.join(", ") : typeof cultures === "string" ? cultures : "—";

	return (
		<section className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					<h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">Прогрес (Adaptive)</h2>
				</div>
				<button
					type="button"
					onClick={() => void load()}
					disabled={loading}
					className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800"
				>
					<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					Обнови
				</button>
			</div>

			{err === "feature_disabled" ? (
				<p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
					Прогресът изисква включен адаптивен tutor на бекенда (<code className="rounded bg-slate-100 px-1 dark:bg-slate-800">FEATURE_TUTOR_ADAPTIVE=true</code>).
				</p>
			) : err ? (
				<p className="mt-4 text-sm text-red-700 dark:text-red-300">Неуспешно зареждане на прогрес.</p>
			) : null}

			{data ? (
				<div className="mt-4 space-y-4">
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50">
							<p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Ниво (оценка)</p>
							<p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{data.computed_level}</p>
						</div>
						<div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50">
							<p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Профил: ниво</p>
							<p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
								{typeof data.profile?.overall_level === "number" ? data.profile.overall_level : "—"}
							</p>
						</div>
						<div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50">
							<p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Култури</p>
							<p className="mt-1 truncate text-sm text-slate-800 dark:text-slate-200">{cultureStr}</p>
						</div>
					</div>

					{data.topics.length === 0 ? (
						<p className="text-sm text-slate-600 dark:text-slate-400">Няма записани теми — направете урок и оценка от раздела «Урок по тема».</p>
					) : (
						<ul className="space-y-3">
							{data.topics.map((t) => {
								const m = Math.round((Number(t.mastery_level) || 0) * 100);
								return (
									<li
										key={t.topic}
										className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/40"
									>
										<div className="flex items-center justify-between gap-2">
											<span className="font-medium text-slate-900 dark:text-slate-100">{t.topic}</span>
											<span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{m}%</span>
										</div>
										<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
											<div
												className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
												style={{ width: `${m}%` }}
											/>
										</div>
										<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
											Опити: {t.attempts ?? 0} · верни: {t.correct_answers ?? 0}
										</p>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			) : !err && loading ? (
				<p className="mt-4 text-sm text-slate-500">Зареждане…</p>
			) : null}
		</section>
	);
}
