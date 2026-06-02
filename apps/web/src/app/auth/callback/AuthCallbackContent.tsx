"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function safeInternalPath(next: string | null, fallback: string): string {
	if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
		return fallback;
	}
	return next;
}

function loginPathFromLocale(locale: string | null): string {
	return locale === "bg" ? "/bg/login" : "/login";
}

async function resolveSessionAfterRedirect(): Promise<Session | null> {
	if (typeof window === "undefined") return null;

	const url = window.location.href;
	const code = new URLSearchParams(window.location.search).get("code");
	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(url);
		if (error) {
			console.error("exchangeCodeForSession:", error);
			return null;
		}
	}

	let {
		data: { session },
	} = await supabase.auth.getSession();
	if (session?.user) return session;

	return await new Promise((resolve) => {
		let done = false;
		let timeoutId: number;

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, s) => {
			if (s?.user && !done) {
				done = true;
				window.clearTimeout(timeoutId);
				subscription.unsubscribe();
				resolve(s);
			}
		});

		timeoutId = window.setTimeout(() => {
			if (done) return;
			done = true;
			subscription.unsubscribe();
			void supabase.auth.getSession().then(({ data: { session: s } }) => resolve(s?.user ? s : null));
		}, 2800);
	});
}

export function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [msg, setMsg] = useState("Обработка на входа…");

	useEffect(() => {
		let cancelled = false;
		const next = safeInternalPath(searchParams.get("next"), "/dashboard");
		const locale = searchParams.get("locale");
		const loginPath = loginPathFromLocale(locale);
		const authFailedMsg =
			locale === "bg"
				? "Неуспешен вход — опитайте отново или поискайте нов линк."
				: "Sign-in failed — try again or request a new link.";

		(async () => {
			const session = await resolveSessionAfterRedirect();
			if (cancelled) return;

			if (!session?.user) {
				router.replace(`${loginPath}?error=${encodeURIComponent(authFailedMsg)}`);
				return;
			}

			const uid = session.user.id;
			const { data: profile, error } = await supabase.from("farm_profiles").select("onboarding_completed").eq("user_id", uid).maybeSingle();

			if (cancelled) return;

			if (error) {
				console.warn("farm_profiles read:", error.message);
				setMsg("Пренасочване…");
				router.replace(next);
				return;
			}

			if (!profile || profile.onboarding_completed !== true) {
				setMsg("Профилът не е завършен — настройване…");
				router.replace("/onboarding");
				return;
			}

			router.replace(next);
		})();

		return () => {
			cancelled = true;
		};
	}, [router, searchParams]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center dark:bg-slate-950">
			<p className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>
		</div>
	);
}
