import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SupabaseLoginForm } from "@/components/Auth/SupabaseLoginForm";
import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	return locale === "bg"
		? {
				title: "Вход · AgriNexus",
				description: "Вход с имейл и парола, magic link или Google (Supabase).",
			}
		: {
				title: "Login · AgriNexus",
				description: "Sign in with email & password, magic link, or Google (Supabase).",
			};
}

const copy = {
	en: {
		kicker: "AgriNexus · apps/web",
		title: "Sign in",
		body: "Use Supabase Auth (configure",
		bodyMid: "in your project). After sign-in you can open the academy or dashboard.",
		back: "← Home",
	},
	bg: {
		kicker: "AgriNexus · apps/web",
		title: "Вход",
		body: "Supabase Auth (настройте",
		bodyMid: "в проекта). След вход — академия или табло.",
		back: "← Начало",
	},
};

export default async function LoginPage({ params }: PageProps) {
	const { locale } = await params;
	setRequestLocale(locale);
	const c = locale === "bg" ? copy.bg : copy.en;
	const appLocale: AppLocale = locale === "bg" ? "bg" : "en";

	return (
		<main className="mx-auto max-w-md px-6 py-16">
			<p className="text-sm font-medium uppercase tracking-wide text-emerald-800">{c.kicker}</p>
			<h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{c.title}</h1>
			<p className="mt-2 text-sm text-slate-600">
				{c.body} <code className="rounded bg-slate-200 px-1">NEXT_PUBLIC_SUPABASE_*</code> {c.bodyMid}
			</p>
			<div className="mt-8">
				<Suspense
					fallback={<p className="text-sm text-slate-500">{locale === "bg" ? "Зареждане…" : "Loading…"}</p>}
				>
					<SupabaseLoginForm locale={appLocale} />
				</Suspense>
			</div>
			<p className="mt-8 text-sm">
				<Link href="/" className="text-emerald-800 underline underline-offset-4">
					{c.back}
				</Link>
			</p>
		</main>
	);
}
