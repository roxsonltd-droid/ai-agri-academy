import os

from supabase import Client, create_client


def get_supabase_client() -> Client:
	url = os.environ.get("SUPABASE_URL", "").strip()
	key = os.environ.get("SUPABASE_KEY", "").strip()
	try:
		from app.core.config import get_settings

		s = get_settings()
		url = (s.supabase_url or url or "").strip()
		key = (s.supabase_key or key or "").strip()
	except Exception:
		pass
	return create_client(url, key)
