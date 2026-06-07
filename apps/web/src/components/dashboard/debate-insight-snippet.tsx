"use client";

import Link from "next/link";
import AnimatedDebateTimeline from "@/components/AnimatedDebateTimeline";

const DEMO_HISTORY = [
	{ agent: "Market", content: "Кратък преглед: ценовият прозорец за пшеница е благоприятен при текущия базис към пристанището." },
	{ agent: "Risk", content: "Внимание: прогнозирани валежи в следващите 48 ч — проверете склад и влага преди продажба." },
	{ agent: "Crop", content: "Агрономски: NDVI спадът е локализиран; препоръчвам прицелен оглед преди широко третиране." },
	{ agent: "Critic", content: "Съгласуване: трите линии са съвместими — акцент върху потвърждение на влага преди финализиране на продажба." },
];

export function DashboardDebateInsight() {
	return (
		<section className="mt-3.5 overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:p-6">
			<div className="mb-3 flex flex-wrap items-end justify-between gap-2">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45 dark:text-slate-400">Academy Tutor</p>
					<h2 className="text-[15px] font-semibold text-ink dark:text-slate-100">Примерен дебат (Deep analysis)</h2>
				</div>
				<Link
					href="/tutor"
					className="rounded-full bg-forest-700 px-3 py-1.5 text-[11px] font-medium text-white no-underline transition hover:bg-forest-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
				>
					Отвори Tutor →
				</Link>
			</div>
			<AnimatedDebateTimeline
				debateHistory={DEMO_HISTORY}
				currentRound={3}
				maxRounds={3}
				finalAnswer="Приоритет: (1) Потвърдете влага в партидата за продажба.\n(2) Огледайте южния блок с дрон при първа възможност.\n(3) Подгответе алтернативен прозорец за продажба, ако валежът забави товаренето."
				consensusLevel="high"
			/>
		</section>
	);
}
