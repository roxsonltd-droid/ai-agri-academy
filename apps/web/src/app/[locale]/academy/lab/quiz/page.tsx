import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { AcademyAiQuizLab } from "@/components/academy/academy-ai-quiz-lab";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	return locale === "bg"
		? {
				title: "AI тест (демо) · Академия · AgriNexus",
				description: "Визуализация на генериран Academy тест чрез backend quiz API.",
			}
		: {
				title: "AI quiz (demo) · Academy · AgriNexus",
				description: "Preview of AI-generated Academy quiz via backend quiz API.",
			};
}

export default async function AcademyAiQuizLabPage({ params }: PageProps) {
	const { locale } = await params;
	setRequestLocale(locale);
	const bg = locale === "bg";

	return (
		<main className="mx-auto max-w-4xl px-6 py-16">
			<p className="text-sm font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
				{bg ? "AgriNexus · Академия" : "AgriNexus · Academy"}
			</p>
			<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
				{bg ? "AI тест: демо и визуализация" : "AI quiz: demo & viewer"}
			</h1>
			<p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
				{bg
					? "Компонентът `GeneratedQuizViewer` + извикване към Next proxy `/api/quiz/generate`. Подходящо за проверка на structured output."
					: "`GeneratedQuizViewer` + call to Next proxy `/api/quiz/generate`. Useful for checking structured output."}
			</p>

			<div className="mt-10">
				<AcademyAiQuizLab />
			</div>

			<p className="mt-12 text-sm">
				<Link href="/academy/lab" className="text-emerald-800 underline underline-offset-4 dark:text-emerald-400">
					{bg ? "← Към лабораторията" : "← Back to lab"}
				</Link>
			</p>
		</main>
	);
}
