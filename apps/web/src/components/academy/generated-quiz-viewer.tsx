"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Clock, ListChecks, Sparkles } from "lucide-react";

import type { GeneratedQuizJson, QuizQuestionJson } from "@/lib/generated-quiz-types";

type Props = {
	quiz: GeneratedQuizJson;
	/** Ако е false, не се показват верни отговори и is_correct (режим „учене“). */
	revealAnswers?: boolean;
	className?: string;
};

function QuestionCard({
	q,
	index,
	reveal,
}: {
	q: QuizQuestionJson;
	index: number;
	reveal: boolean;
}) {
	const [open, setOpen] = useState(true);

	return (
		<article className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/60 sm:p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
						Въпрос {index + 1} · {q.question_type.replace("_", " ")}
					</p>
					<h3 className="mt-1 text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">{q.question_text}</h3>
					{q.topic ? (
						<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Подтема: {q.topic}</p>
					) : null}
				</div>
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					className="shrink-0 rounded-lg border border-slate-200/80 p-1.5 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-900/80"
					aria-expanded={open}
					aria-label={open ? "Скрий детайли" : "Покажи детайли"}
				>
					{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
				</button>
			</div>

			{open ? (
				<div className="mt-4 space-y-3">
					{q.question_type === "multiple_choice" && q.options?.length ? (
						<ul className="space-y-2">
							{q.options.map((opt, i) => (
								<li
									key={`${q.id}-${i}`}
									className={
										reveal && opt.is_correct
											? "rounded-xl border border-emerald-300/80 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-100"
											: "rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
									}
								>
									<span className="font-medium">{String.fromCharCode(65 + i)}.</span> {opt.text}
									{reveal && opt.is_correct ? (
										<span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">(верен)</span>
									) : null}
								</li>
							))}
						</ul>
					) : null}

					{q.question_type === "true_false" ? (
						<p className="text-sm text-slate-600 dark:text-slate-400">
							Очакван отговор:{" "}
							{reveal ? (
								<span className="font-semibold text-slate-900 dark:text-slate-100">{q.correct_answer}</span>
							) : (
								<span className="italic">скрит</span>
							)}
						</p>
					) : null}

					{q.question_type === "open_ended" ? (
						<p className="text-sm text-slate-600 dark:text-slate-400">
							Отворен отговор — еталон:{" "}
							{reveal ? (
								<span className="font-medium text-slate-900 dark:text-slate-100">{q.correct_answer}</span>
							) : (
								<span className="italic">скрит</span>
							)}
						</p>
					) : null}

					<div className="rounded-xl bg-slate-100/80 px-3 py-2 text-sm text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
						<span className="font-semibold text-slate-900 dark:text-slate-100">Обяснение: </span>
						{q.explanation}
					</div>
				</div>
			) : null}
		</article>
	);
}

/**
 * Визуализация на AI генериран тест (read-only). Ползвай след успешен `POST /api/quiz/generate`.
 */
export function GeneratedQuizViewer({ quiz, revealAnswers = false, className = "" }: Props) {
	const meta = useMemo(
		() => ({
			n: quiz.questions?.length ?? 0,
			objCount: quiz.learning_objectives?.length ?? 0,
		}),
		[quiz.questions, quiz.learning_objectives],
	);

	return (
		<section
			className={`rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:from-slate-900/80 dark:to-slate-950/80 sm:p-8 ${className}`}
		>
			<header className="flex flex-col gap-2 border-b border-slate-200/80 pb-4 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-3">
					<div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 text-emerald-700 dark:text-emerald-300">
						<Sparkles className="h-5 w-5" aria-hidden />
					</div>
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">AI Academy тест</p>
						<h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{quiz.topic}</h2>
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
							Ниво: <span className="font-medium">{quiz.difficulty}</span> · Въпроси: {meta.n}
							{typeof quiz.total_questions === "number" ? ` (total_questions: ${quiz.total_questions})` : null}
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
					<span className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-2 py-1 dark:bg-slate-950/60">
						<Clock className="h-4 w-4" aria-hidden />
						~{quiz.estimated_time_minutes} мин
					</span>
					{quiz.generated_at ? (
						<span className="text-xs opacity-80" title="ISO време на генериране">
							{quiz.generated_at}
						</span>
					) : null}
				</div>
			</header>

			{meta.objCount > 0 ? (
				<div className="mt-5">
					<p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
						<BookOpen className="h-3.5 w-3.5" aria-hidden />
						Учебни цели
					</p>
					<ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
						{quiz.learning_objectives.map((o, i) => (
							<li key={i}>{o}</li>
						))}
					</ul>
				</div>
			) : null}

			<div className="mt-6 space-y-4">
				<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
					<ListChecks className="h-3.5 w-3.5" aria-hidden />
					Въпроси
				</p>
				{quiz.questions.map((q, i) => (
					<QuestionCard key={`${q.id}-${i}`} q={q} index={i} reveal={revealAnswers} />
				))}
			</div>

			{!revealAnswers ? (
				<p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
					Верните отговори са скрити. Подай <code className="rounded bg-slate-100 px-1 dark:bg-slate-900">revealAnswers</code> за преглед
					на еталона (само за админ/демо).
				</p>
			) : null}
		</section>
	);
}
