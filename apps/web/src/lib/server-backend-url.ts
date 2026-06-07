/**
 * FastAPI base URL for **server-only** Route Handlers (not exposed to the browser).
 * Prefer `API_URL` on Vercel so `POST /api/tutor/*` can reach the private backend.
 */
export function serverBackendBaseUrl(): string {
	const raw = process.env.API_URL || process.env.BACKEND_ORIGIN || process.env.BACKEND_URL || "http://127.0.0.1:8000";
	return raw.replace(/\/$/, "");
}
