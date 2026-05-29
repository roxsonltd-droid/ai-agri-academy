import { Suspense } from "react";

import { AuthCallbackContent } from "./AuthCallbackContent";

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 dark:bg-slate-950">
					<p className="text-sm text-slate-600 dark:text-slate-400">Зареждане…</p>
				</div>
			}
		>
			<AuthCallbackContent />
		</Suspense>
	);
}
