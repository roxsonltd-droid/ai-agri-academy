"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { GeneratedQuizViewer } from "@/components/academy/generated-quiz-viewer";
import { isGeneratedQuizJson, type GeneratedQuizJson } from "@/lib/generated-quiz-types";

export function AcademyAiQuizLab() {
	const [topic, setTopic] = useState("Торене на пшеница — пролетно подхранване");
	const [userId, setUserId] = useState("demo-user");
	const [difficulty, setDifficulty] = useState("");
	const [reveal, setReveal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [quiz, setQuiz] = useState<GeneratedQuizJson | null>(null);

	const run = async () => {
		setError(null);
		setQuiz(null);
		setLoading(true);
		try {
			const res = await fetch("/api/quiz/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({
					user_id: userId.trim() || "demo-user",
					topic: topic.trim(),
					...(difficulty.trim() ? { difficulty: difficulty.trim() } : {}),
					num_questions: 5,
				}),
			});
			const data: unknown = await res.json().catch(() => ({}));
			if (!res.ok) {
				const detail =
					typeof data === "object" && data !== null && "detail" in data
						? String((data as { detail?: unknown }).detail)
						: res.statusText;
				setError(detail || `HTTP ${res.status}`);
				return;
			}
			if (!isGeneratedQuizJson(data)) {
				setError("Невалиден отговор от сървъра (очакван GeneratedQuiz).");
				return;
			}
			setQuiz(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto max-w-3xl space-y-8">
			<div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 dark:border-white/10 dark:bg-slate-950/60 sm:p-6">
				<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Генериране (демо)</h2>
				<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
					Изисква работещ backend с включен adaptive tutor / quiz API. При грешка провери `.env` и `FEATURE_TUTOR_ADAPTIVE`.
				</p>
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<label className="block text-sm">
						<span className="font-medium text-slate-700 dark:text-slate-300">user_id</span>
						<input
							className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
							value={userId}
							onChange={(e) => setUserId(e.target.value)}
						/>
					</label>
					<label className="block text-sm">
						<span className="font-medium text-slate-700 dark:text-slate-300">difficulty (по избор)</span>
						<input
							className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
							placeholder="beginner | intermediate | advanced"
							value={difficulty}
							onChange={(e) => setDifficulty(e.target.value)}
						/>
					</label>
				</div>
				<label className="mt-3 block text-sm">
					<span className="font-medium text-slate-700 dark:text-slate-300">Тема</span>
					<textarea
						className="mt-1 min-h-[88px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
					/>
				</label>
				<label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} className="rounded border-slate-300" />
					Покажи верни отговори (демо / лектор)
				</label>
				<button
					type="button"
					onClick={() => void run()}
					disabled={loading || !topic.trim()}
					className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
					Генерирай тест
				</button>
				{error ? (
					<p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/50 dark:text-rose-100" role="alert">
						{error}
					</p>
				) : null}
			</div>

			{quiz ? <GeneratedQuizViewer quiz={quiz} revealAnswers={reveal} /> : null}
		</div>
	);
}
