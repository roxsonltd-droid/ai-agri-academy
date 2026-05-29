"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, BrainCircuit, TrendingUp, CloudLightning, Sprout, ScanSearch, Bot, BookOpen, ArrowRight } from "lucide-react";

export type AcademySource = {
	source?: string;
	topic?: string;
	course?: string;
};

export type DebateTurn = {
	agent: string;
	content: string;
	round?: number;
};

export interface AnimatedDebateProps {
	debateHistory: unknown[];
	currentRound?: number;
	maxRounds?: number;
	finalAnswer?: string;
	consensusLevel?: string;
	/** Academy RAG chunk metadata (same as ``/api/tutor/chat`` ``sources``). */
	academySources?: AcademySource[];
}

function normalizeTurn(raw: unknown): DebateTurn | null {
	if (!raw || typeof raw !== "object") return null;
	const o = raw as Record<string, unknown>;
	const agent = String(o.agent ?? o.name ?? o.role ?? "Agent");
	const content = String(o.content ?? o.text ?? o.message ?? "");
	if (!content.trim()) return null;
	return { agent, content, round: typeof o.round === "number" ? o.round : undefined };
}

function agentStyle(agent: string): { Icon: typeof Bot; ring: string; bg: string; text: string } {
	const a = agent.toLowerCase();
	if (a.includes("orchestr")) {
		return {
			Icon: BrainCircuit,
			ring: "ring-teal-500/30",
			bg: "bg-teal-500/12 dark:bg-teal-500/18",
			text: "text-teal-800 dark:text-teal-200",
		};
	}
	if (a.includes("market")) {
		return {
			Icon: TrendingUp,
			ring: "ring-amber-500/30",
			bg: "bg-amber-500/15 dark:bg-amber-500/20",
			text: "text-amber-800 dark:text-amber-200",
		};
	}
	if (a.includes("risk") || a.includes("weather")) {
		return {
			Icon: CloudLightning,
			ring: "ring-red-500/25",
			bg: "bg-red-500/10 dark:bg-red-500/15",
			text: "text-red-800 dark:text-red-200",
		};
	}
	if (a.includes("crop")) {
		return {
			Icon: Sprout,
			ring: "ring-emerald-500/30",
			bg: "bg-emerald-500/12 dark:bg-emerald-500/18",
			text: "text-emerald-800 dark:text-emerald-200",
		};
	}
	if (a.includes("critic")) {
		return {
			Icon: ScanSearch,
			ring: "ring-violet-500/30",
			bg: "bg-violet-500/12 dark:bg-violet-500/18",
			text: "text-violet-800 dark:text-violet-200",
		};
	}
	return {
		Icon: Bot,
		ring: "ring-slate-400/30",
		bg: "bg-slate-500/10 dark:bg-slate-500/20",
		text: "text-slate-700 dark:text-slate-200",
	};
}

export default function AnimatedDebateTimeline({
	debateHistory,
	currentRound = 1,
	maxRounds = 1,
	finalAnswer,
	consensusLevel,
	academySources = [],
}: AnimatedDebateProps) {
	const turns = useMemo(() => debateHistory.map(normalizeTurn).filter(Boolean) as DebateTurn[], [debateHistory]);

	const [visibleCount, setVisibleCount] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [showFinal, setShowFinal] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		setVisibleCount(0);
		setShowFinal(false);
		setIsPlaying(true);
	}, [debateHistory]);

	useEffect(() => {
		if (turns.length === 0 && finalAnswer) {
			setShowFinal(true);
			setIsPlaying(false);
		}
	}, [turns.length, finalAnswer]);

	useEffect(() => {
		if (!isPlaying || turns.length === 0) return;

		if (visibleCount >= turns.length) {
			const t = setTimeout(() => {
				setShowFinal(true);
				setIsPlaying(false);
				setTimeout(() => {
					itemRefs.current[turns.length]?.scrollIntoView({ behavior: "smooth", block: "center" });
				}, 120);
			}, 900);
			return () => clearTimeout(t);
		}

		const t = setTimeout(() => {
			setVisibleCount((c) => c + 1);
			setTimeout(() => {
				itemRefs.current[visibleCount]?.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 80);
		}, 1400);

		return () => clearTimeout(t);
	}, [visibleCount, isPlaying, turns.length]);

	const progress = maxRounds > 1 ? ((currentRound - 1) / Math.max(maxRounds - 1, 1)) * 100 : 0;

	return (
		<div
			className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/80 sm:p-8"
			ref={containerRef}
		>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50">
					<BrainCircuit className="h-6 w-6 text-forest-600 dark:text-emerald-400" aria-hidden />
					Deep Debate — визуализация
				</h3>

				<button
					type="button"
					onClick={() => setIsPlaying((p) => !p)}
					className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
				>
					{isPlaying ? <Pause size={16} /> : <Play size={16} />}
					{isPlaying ? "Пауза" : "Пусни"}
				</button>
			</div>

			<div className="mb-6 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
				<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
					Поток на системата
				</p>
				<ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 sm:text-xs">
					<li className="flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white px-2.5 py-1 dark:border-emerald-800/60 dark:bg-slate-900/80">
						<BookOpen className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
						Academy RAG
					</li>
					<ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
					<li className="flex items-center gap-1 rounded-full border border-amber-200/80 bg-white px-2.5 py-1 dark:border-amber-800/50 dark:bg-slate-900/80">
						<TrendingUp className="h-3.5 w-3.5 text-amber-700" aria-hidden />
						Пазар
					</li>
					<ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
					<li className="flex items-center gap-1 rounded-full border border-red-200/80 bg-white px-2.5 py-1 dark:border-red-900/50 dark:bg-slate-900/80">
						<CloudLightning className="h-3.5 w-3.5 text-red-700" aria-hidden />
						Риск
					</li>
					<ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
					<li className="flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white px-2.5 py-1 dark:border-emerald-800/50 dark:bg-slate-900/80">
						<Sprout className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
						Култури
					</li>
					<ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
					<li className="flex items-center gap-1 rounded-full border border-violet-200/80 bg-white px-2.5 py-1 dark:border-violet-800/50 dark:bg-slate-900/80">
						<ScanSearch className="h-3.5 w-3.5 text-violet-700" aria-hidden />
						Критик
					</li>
					<ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
					<li className="flex items-center gap-1 rounded-full border border-teal-200/80 bg-white px-2.5 py-1 dark:border-teal-800/50 dark:bg-slate-900/80">
						<BrainCircuit className="h-3.5 w-3.5 text-teal-700" aria-hidden />
						Синтез
					</li>
				</ol>
				<p className="mt-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
					Първо се зарежда контекст от Academy (RAG), после всеки агент добавя мнение; критикът проверява съгласуваността с материалите; накрая оркестраторът дава финална препоръка.
				</p>
			</div>

			{academySources.length > 0 ? (
				<details className="mb-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
					<summary className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200">
						Academy източници ({academySources.length})
					</summary>
					<ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
						{academySources.map((s, i) => (
							<li key={`${s.source ?? "s"}-${i}`} className="border-l-2 border-emerald-500/40 pl-3">
								{s.topic ? <span className="font-medium text-slate-800 dark:text-slate-100">{s.topic}</span> : null}
								{s.course ? (
									<span className="text-slate-500 dark:text-slate-400"> · курс: {s.course}</span>
								) : null}
								{s.source ? <div className="text-xs text-slate-500 dark:text-slate-500">{s.source}</div> : null}
							</li>
						))}
					</ul>
				</details>
			) : null}

			{maxRounds > 1 && (
				<div className="mb-8">
					<div className="mb-1 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
						<span>
							Рунд {currentRound} от {maxRounds}
						</span>
						<span>{Math.round(progress)}% завършено</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
						<div
							className="h-full bg-gradient-to-r from-forest-600 to-emerald-500 transition-all duration-700 dark:from-emerald-600 dark:to-teal-400"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}

			<div className="space-y-6">
				{turns.map((item, index) => {
					const { Icon, ring, bg, text } = agentStyle(item.agent);
					const revealed = visibleCount > index;
					const active = visibleCount === index + 1 && isPlaying;
					return (
						<div
							key={`${item.agent}-${index}`}
							ref={(el) => {
								itemRefs.current[index] = el;
							}}
							className={`rounded-2xl border p-5 shadow-sm transition-all duration-700 dark:shadow-none ${
								revealed
									? "translate-y-0 border-slate-200/90 bg-white opacity-100 dark:border-white/10 dark:bg-slate-950/80"
									: "translate-y-3 border-slate-100 bg-slate-50/80 opacity-40 dark:border-white/5 dark:bg-slate-900/40"
							}`}
						>
							<div className="flex items-start gap-4">
								<div
									className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/40 ring-2 transition-colors duration-500 dark:border-white/10 ${revealed ? `${bg} ${ring} ${text}` : "bg-slate-100 text-slate-400 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-500"}`}
								>
									<Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
								</div>

								<div className="min-w-0 flex-1">
									<p className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
										{item.agent}
										{active && (
											<span className="relative ml-1 flex h-2 w-2">
												<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
												<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
											</span>
										)}
									</p>
									<p
										className={`mt-1.5 whitespace-pre-wrap text-[15.5px] leading-relaxed transition-all duration-500 ${
											revealed ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
										}`}
									>
										{revealed ? item.content : "Обмисля позицията си…"}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div
				ref={(el) => {
					itemRefs.current[turns.length] = el;
				}}
				className={`mt-10 transition-all duration-1000 ${showFinal ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}
			>
				{finalAnswer && (
					<div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50 p-7 shadow-sm dark:border-emerald-500/25 dark:from-emerald-950/50 dark:to-slate-900/80">
						<div className="mb-5 flex flex-wrap items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
								<BrainCircuit className="h-6 w-6" aria-hidden />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Финална препоръка</p>
								<p className="text-sm font-medium text-emerald-700/90 dark:text-emerald-300/90">Синтез от оркестратор</p>
							</div>
							{consensusLevel && (
								<span
									className={`rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm ${
										consensusLevel === "high"
											? "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200"
											: "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-100"
									}`}
								>
									{consensusLevel === "high" ? "Високо съгласие" : "Средно съгласие"}
								</span>
							)}
						</div>
						<div className="prose prose-emerald max-w-none text-[16px] leading-relaxed text-slate-800 dark:prose-invert dark:text-slate-200">
							{finalAnswer.split("\n").map((line, i) => (
								<p key={i} className="mb-2">
									{line}
								</p>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
