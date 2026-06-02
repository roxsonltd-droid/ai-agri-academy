"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Props = { locale: AppLocale };

const MIN_PASSWORD = 6;

function getSiteUrl(): string {
	if (typeof window !== "undefined") return window.location.origin;
	return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function homeAfterAuth(locale: AppLocale): string {
	return locale === "en" ? "/academy" : "/bg/academy";
}

function buildAuthCallbackUrl(locale: AppLocale): string {
	const next = homeAfterAuth(locale);
	return `${getSiteUrl()}/auth/callback?${new URLSearchParams({ next, locale }).toString()}`;
}

type AuthTab = "signin" | "signup" | "magic";

export function SupabaseLoginForm({ locale }: Props) {
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [tab, setTab] = useState<AuthTab>("signin");
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const copy =
		locale === "bg"
			? {
					google: "Продължи с Google",
					tabs: { signin: "Вход", signup: "Регистрация", magic: "Линк по имейл" },
					emailLabel: "Имейл",
					passwordLabel: "Парола",
					confirmLabel: "Парола отново",
					placeholder: "ti@ferma.example",
					signIn: "Влез",
					signUp: "Създай акаунт",
					magic: "Изпрати линк за вход",
					hint: "В Supabase: Authentication → URL configuration — добавете /auth/callback. Включете Email (и по желание Google).",
					disabled: "Задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local",
					sentMagic: "Проверете пощата за линк за вход.",
					sentConfirm: "Проверете пощата и потвърдете регистрацията, после влезте с парола.",
					shortPassword: `Паролата трябва да е поне ${MIN_PASSWORD} символа.`,
					passwordMismatch: "Паролите не съвпадат.",
					needEmail: "Въведете имейл.",
					orEmail: "или имейл",
				}
			: {
					google: "Continue with Google",
					tabs: { signin: "Sign in", signup: "Register", magic: "Email link" },
					emailLabel: "Email",
					passwordLabel: "Password",
					confirmLabel: "Confirm password",
					placeholder: "you@farm.example",
					signIn: "Sign in",
					signUp: "Create account",
					magic: "Email me a magic link",
					hint: "In Supabase: Authentication → URL configuration — add /auth/callback. Enable Email (and optionally Google).",
					disabled: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
					sentMagic: "Check your inbox for the sign-in link.",
					sentConfirm: "Check your email to confirm your account, then sign in with your password.",
					shortPassword: `Password must be at least ${MIN_PASSWORD} characters.`,
					passwordMismatch: "Passwords do not match.",
					needEmail: "Enter your email.",
					orEmail: "or email",
				};

	useEffect(() => {
		const err = searchParams.get("error");
		if (err) setError(err);
	}, [searchParams]);

	if (!isSupabaseConfigured()) {
		return (
			<p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{copy.disabled}</p>
		);
	}

	function goThroughCallback() {
		window.location.assign(buildAuthCallbackUrl(locale));
	}

	async function signInGoogle() {
		setBusy(true);
		setError(null);
		setMessage(null);
		const { error: err } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: buildAuthCallbackUrl(locale) },
		});
		setBusy(false);
		if (err) setError(err.message);
	}

	async function signInPassword() {
		if (!email.trim()) {
			setError(copy.needEmail);
			return;
		}
		if (password.length < MIN_PASSWORD) {
			setError(copy.shortPassword);
			return;
		}
		setBusy(true);
		setError(null);
		setMessage(null);
		const { error: err } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password,
		});
		setBusy(false);
		if (err) {
			setError(err.message);
			return;
		}
		goThroughCallback();
	}

	async function signUpPassword() {
		if (!email.trim()) {
			setError(copy.needEmail);
			return;
		}
		if (password.length < MIN_PASSWORD) {
			setError(copy.shortPassword);
			return;
		}
		if (password !== confirmPassword) {
			setError(copy.passwordMismatch);
			return;
		}
		setBusy(true);
		setError(null);
		setMessage(null);
		const { data, error: err } = await supabase.auth.signUp({
			email: email.trim(),
			password,
			options: { emailRedirectTo: buildAuthCallbackUrl(locale) },
		});
		setBusy(false);
		if (err) {
			setError(err.message);
			return;
		}
		if (data.session) {
			goThroughCallback();
			return;
		}
		setMessage(copy.sentConfirm);
	}

	async function signInMagicLink() {
		if (!email.trim()) {
			setError(copy.needEmail);
			return;
		}
		setBusy(true);
		setError(null);
		setMessage(null);
		const { error: err } = await supabase.auth.signInWithOtp({
			email: email.trim(),
			options: { emailRedirectTo: buildAuthCallbackUrl(locale) },
		});
		setBusy(false);
		if (err) setError(err.message);
		else setMessage(copy.sentMagic);
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
				<span className="bg-white px-2">{copy.orEmail}</span>
				<hr className="absolute left-0 right-0 top-1/2 -z-10 border-slate-200" />
			</div>

			<div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
				{(["signin", "signup", "magic"] as const).map((key) => (
					<button
						key={key}
						type="button"
						disabled={busy}
						onClick={() => {
							setTab(key);
							setError(null);
							setMessage(null);
						}}
						className={`flex-1 rounded-md py-2 transition ${tab === key ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
					>
						{copy.tabs[key]}
					</button>
				))}
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

			{tab !== "magic" ? (
				<>
					<label className="block text-sm font-medium text-slate-700">
						{copy.passwordLabel}
						<input
							type="password"
							name="password"
							autoComplete={tab === "signup" ? "new-password" : "current-password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-600"
						/>
					</label>
					{tab === "signup" ? (
						<label className="block text-sm font-medium text-slate-700">
							{copy.confirmLabel}
							<input
								type="password"
								name="confirmPassword"
								autoComplete="new-password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-emerald-600"
							/>
						</label>
					) : null}
					<button
						type="button"
						onClick={() => void (tab === "signup" ? signUpPassword() : signInPassword())}
						disabled={busy}
						className="w-full rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
					>
						{tab === "signup" ? copy.signUp : copy.signIn}
					</button>
				</>
			) : (
				<button
					type="button"
					onClick={() => void signInMagicLink()}
					disabled={busy}
					className="w-full rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
				>
					{copy.magic}
				</button>
			)}

			<p className="text-xs text-slate-500">{copy.hint}</p>
			{message ? <p className="text-sm text-emerald-800">{message}</p> : null}
			{error ? <p className="text-sm text-red-700">{error}</p> : null}
		</div>
	);
}
