import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function supabasePublicEnv() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return null;
	return { url, key };
}

export default async function middleware(request: NextRequest) {
	const intlResponse = intlMiddleware(request);

	const env = supabasePublicEnv();
	if (!env) {
		return intlResponse;
	}

	const supabase = createServerClient(env.url, env.key, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					intlResponse.cookies.set(name, value, options);
				});
			},
		},
	});

	await supabase.auth.getUser();
	return intlResponse;
}

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
