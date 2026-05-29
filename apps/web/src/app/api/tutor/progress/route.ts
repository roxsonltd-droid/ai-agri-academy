import { NextRequest, NextResponse } from "next/server";

import { serverBackendBaseUrl } from "@/lib/server-backend-url";

/** Proxies to FastAPI `GET /api/tutor/progress?user_id=`. */
export async function GET(req: NextRequest) {
	try {
		const userId = req.nextUrl.searchParams.get("user_id")?.trim();
		if (!userId) {
			return NextResponse.json({ error: "user_id_required" }, { status: 400 });
		}

		const backendUrl = serverBackendBaseUrl();
		const url = `${backendUrl}/api/tutor/progress?user_id=${encodeURIComponent(userId)}`;
		const response = await fetch(url, {
			method: "GET",
			headers: { Accept: "application/json" },
		});

		const text = await response.text();
		let data: unknown = {};
		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			data = { detail: text || response.statusText };
		}

		if (!response.ok) {
			return NextResponse.json(
				typeof data === "object" && data !== null ? data : { error: text },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("GET /api/tutor/progress proxy:", error);
		return NextResponse.json({ error: "proxy_failed", detail: String(error) }, { status: 500 });
	}
}
