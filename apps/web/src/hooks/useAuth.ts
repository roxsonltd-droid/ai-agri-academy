import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session: s } }) => {
			setSession(s);
			setUser(s?.user ?? null);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, s) => {
			setSession(s);
			setUser(s?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signOut = useCallback(() => supabase.auth.signOut(), []);

	const getAccessToken = useCallback(async () => {
		const { data } = await supabase.auth.getSession();
		return data.session?.access_token ?? null;
	}, []);

	return { user, session, loading, signOut, getAccessToken };
}
