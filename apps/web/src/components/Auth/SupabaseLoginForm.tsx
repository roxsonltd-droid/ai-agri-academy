"use client";

import { useState } from "react";
import type { AppLocale } from "@/i18n/routing";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Props = { locale: AppLocale };

function getSiteUrl(): string {
	if (typeof window !== "undefined") return window.location.origin;
	return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function SupabaseLoginForm({ locale }: Props) {
	const [email, setEmail] = useState("");
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const redirectAfterAuth = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(
		locale === "en" ? "/academy" : "/bg/academy",
	)}`;

	const copy =
		locale === "bg"
			? {
					google: "Продължи с Google",
					magic: "Изпрати линк по имейл",
					emailLabel: "Имейл",
					placeholder: "ti@ferma.example",
					hint: "След входа ще бъдете пренасочени към академията. За Google включете доставчика в Supabase Dashboard.",
					disabled: "Задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local",
					sent: "Проверете пощата за линк за вход.",
					or: "или",
				}
			: {
					google: "Continue with Google",
					magic: "Email me a magic link",
					emailLabel: "Email",
					placeholder: "you@farm.example",
					hint: "After sign-in you will be redirected to the academy. Enable the Google provider in the Supabase dashboard.",
					disabled: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
					sent: "Check your inbox for the sign-in link.",
					or: "or",
				};

	if (!isSupabaseConfigured()) {
		return (
			<p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{copy.disabled}</p>
		);
	}

	async function signInGoogle() {
		setBusy(true);
		setError(null);
		setMessage(null);
		const { error: err } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: redirectAfterAuth },
		});
		setBusy(false);
		if (err) setError(err.message);
	}

	async function signInMagicLink() {
		if (!email.trim()) {
			setError(locale === "bg" ? "Въведете имейл." : "Enter your email.");
			return;
		}
		setBusy(true);
		setError(null);
		setMessage(null);
		const { error: err } = await supabase.auth.signInWithOtp({
			email: email.trim(),
			options: { emailRedirectTo: redirectAfterAuth },
		});
		setBusy(false);
		if (err) setError(err.message);
		else setMessage(copy.sent);
	}

	return (
		<div className="space-y-4">
			<button
				type="button"
				onClick={() => void signInGoogle()}
				disabled={busy}
				className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
			>
				{copy.google}
			</button>
			<div className="relative py-2 text-center text-xs uppercase tracking-wide text-slate-400">
				<span className="bg-white px-2">{copy.or}</span>
				<hr className="absolute left-0 right-0 top-1/2 -z-10 border-slate-200" />
			</div>
			<label className="block text-sm font-medium text-slate-700">
				{copy.emailLabel}
				<input
					type="email"
					name="email"
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-600"
					placeholder={copy.placeholder}
				/>
			</label>
			<button
				type="button"
				onClick={() => void signInMagicLink()}
				disabled={busy}
				className="w-full rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
			>
				{copy.magic}
			</button>
			<p className="text-xs text-slate-500">{copy.hint}</p>
			{message ? <p className="text-sm text-emerald-800">{message}</p> : null}
			{error ? <p className="text-sm text-red-700">{error}</p> : null}
		</div>
	);
}
