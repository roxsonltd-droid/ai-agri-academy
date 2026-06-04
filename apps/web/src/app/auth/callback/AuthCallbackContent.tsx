"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function safeInternalPath(next: string | null, fallback: string): string {
	if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
		return fallback;
	}
	return next;
}

export function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [msg, setMsg] = useState("Обработка на входа…");

	useEffect(() => {
		let cancelled = false;
		const next = safeInternalPath(searchParams.get("next"), "/dashboard");

		(async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (cancelled) return;
			if (!session?.user) {
				router.replace("/login");
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
