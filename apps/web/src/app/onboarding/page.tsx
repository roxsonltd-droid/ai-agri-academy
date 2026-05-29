"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ChevronRight, ChevronLeft, Sprout, MapPin, Gauge, Check } from "lucide-react";

const culturesOptions = ["Пшеница", "Царевица", "Слънчоглед", "Ечемик", "Рапица", "Домати", "Краставици", "Лавандула", "Лозя"];
const regionOptions = [
	"Северозападен",
	"Северен централен",
	"Североизточен",
	"Югоизточен",
	"Южен централен",
	"Югозападен",
];
const experienceOptions = [
	{ id: "beginner", label: "Започвам / до 3 сезона", hint: "Базови препоръки и по-малко жаргон." },
	{ id: "intermediate", label: "3–10 сезона", hint: "Баланс между детайл и скорост." },
	{ id: "advanced", label: "10+ сезона / агроном", hint: "По-компактни отговори и повече контекст за операции." },
];

const STEPS = ["Култури", "Регион и площ", "Опит", "Преглед"] as const;

export default function OnboardingPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [step, setStep] = useState(0);
	const [cultures, setCultures] = useState<string[]>([]);
	const [region, setRegion] = useState("");
	const [totalHa, setTotalHa] = useState<number | "">("");
	const [experience, setExperience] = useState<string>("intermediate");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!authLoading && !user) router.replace("/login");
	}, [user, authLoading, router]);

	const toggleCulture = (c: string) => {
		setCultures((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
	};

	const canNext = () => {
		if (step === 0) return cultures.length > 0;
		if (step === 1) return !!region && totalHa !== "" && Number(totalHa) >= 0;
		if (step === 2) return !!experience;
		return true;
	};

	const next = () => {
		if (!canNext()) {
			setError("Попълнете задължителните полета.");
			return;
		}
		setError("");
		setStep((s) => Math.min(s + 1, STEPS.length - 1));
	};

	const back = () => {
		setError("");
		setStep((s) => Math.max(0, s - 1));
	};

	const handleSubmit = async () => {
		if (!user) return;
		if (!region || cultures.length === 0 || totalHa === "") {
			setError("Моля, попълнете всички стъпки.");
			return;
		}
		setLoading(true);
		setError("");

		const { error: updateError } = await supabase
			.from("farm_profiles")
			.update({
				cultures,
				region,
				total_ha: Number(totalHa),
				onboarding_completed: true,
			})
			.eq("user_id", user.id);

		setLoading(false);

		if (updateError) {
			setError("Грешка при запазване: " + updateError.message);
			return;
		}

		try {
			localStorage.setItem("agrinexus_onboarding_experience", experience);
		} catch {
			/* ignore */
		}

		router.push("/dashboard");
	};

	if (authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-paper dark:bg-slate-950">
				<p className="text-sm text-slate-500 dark:text-slate-400">Зареждане…</p>
			</div>
		);
	}
	if (!user) return null;

	return (
		<div className="min-h-screen bg-gradient-to-b from-paper via-white to-slate-50 px-4 py-10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6 lg:py-14">
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 flex items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">AgriNexus</p>
						<h1 className="mt-1 font-serif text-2xl font-semibold text-slate-900 dark:text-slate-50 sm:text-3xl">Настройка на стопанството</h1>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							След регистрация — култури, регион и опит, за да персонализираме съветите и Tutor.
						</p>
					</div>
					<span className="hidden rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 sm:inline-block">
						Стъпка {step + 1}/{STEPS.length}
					</span>
				</div>

				<ol className="mb-8 flex flex-wrap gap-2">
					{STEPS.map((label, i) => (
						<li
							key={label}
							className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
								i === step
									? "bg-forest-700 text-white dark:bg-emerald-600"
									: i < step
										? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
										: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
							}`}
						>
							{i < step ? <Check className="h-3.5 w-3.5" /> : <span className="tabular-nums">{i + 1}</span>}
							{label}
						</li>
					))}
				</ol>

				<div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85 sm:p-8">
					{error ? (
						<div className="mb-6 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
							{error}
						</div>
					) : null}

					{step === 0 && (
						<div>
							<div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
								<Sprout className="h-5 w-5 text-emerald-600" aria-hidden />
								<h2 className="text-lg font-semibold">Кои култури отглеждате?</h2>
							</div>
							<p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Изберете една или повече.</p>
							<div className="flex flex-wrap gap-2">
								{culturesOptions.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => toggleCulture(c)}
										className={`rounded-full px-4 py-2 text-sm font-medium transition ${
											cultures.includes(c)
												? "bg-emerald-600 text-white shadow-md dark:bg-emerald-500"
												: "border border-slate-200/90 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
										}`}
									>
										{c}
									</button>
								))}
							</div>
						</div>
					)}

					{step === 1 && (
						<div className="space-y-6">
							<div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
								<MapPin className="h-5 w-5 text-emerald-600" aria-hidden />
								<h2 className="text-lg font-semibold">Регион и площ</h2>
							</div>
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Регион</label>
								<select
									value={region}
									onChange={(e) => setRegion(e.target.value)}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-slate-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
								>
									<option value="">Изберете…</option>
									{regionOptions.map((r) => (
										<option key={r} value={r}>
											{r}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Общи хектари</label>
								<input
									type="number"
									min={0}
									step="any"
									value={totalHa}
									onChange={(e) => setTotalHa(e.target.value === "" ? "" : Number(e.target.value))}
									placeholder="Напр. 150"
									className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-slate-900 outline-none ring-emerald-500/30 focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
								/>
							</div>
						</div>
					)}

					{step === 2 && (
						<div>
							<div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
								<Gauge className="h-5 w-5 text-emerald-600" aria-hidden />
								<h2 className="text-lg font-semibold">Опит в земеделие</h2>
							</div>
							<p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Използваме го за тон и ниво на детайлност в съветите.</p>
							<div className="space-y-3">
								{experienceOptions.map((opt) => (
									<button
										key={opt.id}
										type="button"
										onClick={() => setExperience(opt.id)}
										className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
											experience === opt.id
												? "border-emerald-500 bg-emerald-50/90 shadow-md dark:border-emerald-500/60 dark:bg-emerald-950/40"
												: "border-slate-200/90 bg-slate-50/50 hover:border-emerald-300/60 dark:border-white/10 dark:bg-slate-800/50"
										}`}
									>
										<p className="font-semibold text-slate-900 dark:text-slate-100">{opt.label}</p>
										<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{opt.hint}</p>
									</button>
								))}
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
							<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Преглед</h2>
							<ul className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/50">
								<li>
									<span className="font-medium text-slate-900 dark:text-slate-100">Култури: </span>
									{cultures.join(", ")}
								</li>
								<li>
									<span className="font-medium text-slate-900 dark:text-slate-100">Регион: </span>
									{region || "—"}
								</li>
								<li>
									<span className="font-medium text-slate-900 dark:text-slate-100">Площ (ha): </span>
									{totalHa === "" ? "—" : totalHa}
								</li>
								<li>
									<span className="font-medium text-slate-900 dark:text-slate-100">Опит: </span>
									{experienceOptions.find((e) => e.id === experience)?.label}
								</li>
							</ul>
						</div>
					)}

					<div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-6 dark:border-white/10 sm:flex-row sm:justify-between">
						<button
							type="button"
							onClick={back}
							disabled={step === 0 || loading}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
						>
							<ChevronLeft className="h-4 w-4" aria-hidden />
							Назад
						</button>
						{step < STEPS.length - 1 ? (
							<button
								type="button"
								onClick={next}
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
							>
								Напред
								<ChevronRight className="h-4 w-4" aria-hidden />
							</button>
						) : (
							<button
								type="button"
								onClick={handleSubmit}
								disabled={loading}
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-forest-600 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
							>
								{loading ? "Запазване…" : "Завърши и към таблото"}
								<ChevronRight className="h-4 w-4" aria-hidden />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
