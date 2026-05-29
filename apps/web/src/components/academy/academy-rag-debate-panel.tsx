"use client";

import { useCallback, useId, useState } from "react";
import { BookOpen, Loader2, MessagesSquare, Sparkles } from "lucide-react";

import AnimatedDebateTimeline from "@/components/AnimatedDebateTimeline";

export type AcademyRagLabels = {
	title: string;
	subtitle: string;
	placeholder: string;
	askRag: string;
	deepDebate: string;
	busyRag: string;
	busyDebate: string;
	sources: string;
	errorPrefix: string;
	hintBackend: string;
};

type SourceItem = { source?: string; topic?: string; course?: string };

type Props = {
	slug: string;
	labels: AcademyRagLabels;
};

export function AcademyRagDebatePanel({ slug, labels }: Props) {
	const formId = useId();
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState<string | null>(null);
	const [sources, setSources] = useState<SourceItem[]>([]);
	const [debate, setDebate] = useState<{
		debate_history?: unknown[];
		final_answer?: string;
		consensus_level?: string;
		sources?: SourceItem[];
	} | null>(null);
	const [mode, setMode] = useState<"idle" | "rag" | "debate">("idle");

	const userId = `academy_web_${slug}`;

	const runRag = useCallback(async () => {
		const q = question.trim();
		if (!q || mode !== "idle") return;
		setMode("rag");
		setAnswer(null);
		setSources([]);
		setDebate(null);
		try {
			const res = await fetch("/api/tutor/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({
					question: q,
					userId,
					culture: slug,
					region: "",
				}),
			});
			const data = (await res.json()) as { answer?: string; sources?: SourceItem[]; detail?: string; error?: string };
			if (!res.ok) {
				setAnswer(`${labels.errorPrefix}: ${data.detail ?? data.error ?? res.statusText}`);
				return;
			}
			setAnswer(typeof data.answer === "string" ? data.answer : "");
			setSources(Array.isArray(data.sources) ? data.sources : []);
		} catch (e) {
			setAnswer(`${labels.errorPrefix}: ${e instanceof Error ? e.message : "network"}`);
		} finally {
			setMode("idle");
		}
	}, [question, mode, userId, slug, labels.errorPrefix]);

	const runDebate = useCallback(async () => {
		const q = question.trim();
		if (!q || mode !== "idle") return;
		setMode("debate");
		setAnswer(null);
		setSources([]);
		setDebate(null);
		try {
			const res = await fetch("/api/tutor/deep-debate", {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({
					question: q,
					userId,
					culture: slug,
					region: "",
					useDebate: true,
				}),
			});
			const data = (await res.json()) as {
				final_answer?: string;
				debate_history?: unknown[];
				consensus_level?: string;
				sources?: SourceItem[];
				detail?: string;
				error?: string;
			};
			if (!res.ok) {
				setAnswer(`${labels.errorPrefix}: ${data.detail ?? data.error ?? res.statusText}`);
				return;
			}
			setDebate({
				debate_history: Array.isArray(data.debate_history) ? data.debate_history : [],
				final_answer: typeof data.final_answer === "string" ? data.final_answer : "",
				consensus_level: typeof data.consensus_level === "string" ? data.consensus_level : undefined,
				sources: Array.isArray(data.sources) ? data.sources : [],
			});
		} catch (e) {
			setAnswer(`${labels.errorPrefix}: ${e instanceof Error ? e.message : "network"}`);
		} finally {
			setMode("idle");
		}
	}, [question, mode, userId, slug, labels.errorPrefix]);

	const busy = mode !== "idle";

	return (
		<section
			className="mt-10 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-950/80 sm:p-8"
			aria-labelledby={`${formId}-title`}
		>
			<div className="flex flex-wrap items-start gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md dark:bg-emerald-500">
					<BookOpen className="h-5 w-5" aria-hidden />
				</div>
				<div className="min-w-0 flex-1">
					<h2 id={`${formId}-title`} className="text-lg font-semibold text-slate-900 dark:text-slate-50">
						{labels.title}
					</h2>
					<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{labels.subtitle}</p>
					<p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{labels.hintBackend}</p>
				</div>
			</div>

			<label htmlFor={`${formId}-q`} className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-300">
				<span className="sr-only">{labels.placeholder}</span>
				<textarea
					id={`${formId}-q`}
					rows={3}
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					placeholder={labels.placeholder}
					disabled={busy}
					className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-inner outline-none focus:border-emerald-600 disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
				/>
			</label>

			<div className="mt-4 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={() => void runRag()}
					disabled={busy || !question.trim()}
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-900 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
				>
					{mode === "rag" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MessagesSquare className="h-4 w-4" aria-hidden />}
					{mode === "rag" ? labels.busyRag : labels.askRag}
				</button>
				<button
					type="button"
					onClick={() => void runDebate()}
					disabled={busy || !question.trim()}
					className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/40 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500/30 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-emerald-950/50"
				>
					{mode === "debate" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
					{mode === "debate" ? labels.busyDebate : labels.deepDebate}
				</button>
			</div>

			{answer ? (
				<div className="mt-6 rounded-xl border border-slate-200/90 bg-white/90 p-4 text-sm leading-relaxed text-slate-800 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100">
					<p className="whitespace-pre-wrap">{answer}</p>
				</div>
			) : null}

			{sources.length > 0 ? (
				<div className="mt-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{labels.sources}</p>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
						{sources.map((s, i) => (
							<li key={`${s.source ?? i}-${i}`}>
								{s.topic ? <span className="font-medium">{s.topic}</span> : null}
								{s.source ? <span className="text-slate-500"> — {s.source}</span> : null}
							</li>
						))}
					</ul>
				</div>
			) : null}

			{debate ? (
				<div className="mt-6 space-y-4">
					<AnimatedDebateTimeline
						debateHistory={debate.debate_history ?? []}
						finalAnswer={debate.final_answer}
						consensusLevel={debate.consensus_level}
						academySources={debate.sources ?? []}
					/>
				</div>
			) : null}
		</section>
	);
}
