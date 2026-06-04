import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

/** Browser client (cookie-friendly; pair with ``src/middleware.ts`` session refresh). */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
	return (
		Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
		Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
		!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")
	);
}
