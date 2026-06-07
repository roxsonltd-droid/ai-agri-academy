"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<span
				className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/40 dark:border-white/10 dark:bg-slate-800/50 ${className}`}
				aria-hidden
			/>
		);
	}

	const cycle = () => {
		if (theme === "light") setTheme("dark");
		else if (theme === "dark") setTheme("system");
		else setTheme("light");
	};

	const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
	const label =
		theme === "light" ? "Светла тема" : theme === "dark" ? "Тъмна тема" : `Системна (${resolvedTheme === "dark" ? "тъмна" : "светла"})`;

	return (
		<button
			type="button"
			onClick={cycle}
			title={label}
			aria-label={label}
			className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/60 text-ink shadow-sm transition hover:bg-white/90 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`}
		>
			<Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
		</button>
	);
}
