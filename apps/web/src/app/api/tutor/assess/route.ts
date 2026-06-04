import { NextRequest, NextResponse } from "next/server";

import { serverBackendBaseUrl } from "@/lib/server-backend-url";

/** Proxies to FastAPI `POST /api/tutor/assess`. */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const backendUrl = serverBackendBaseUrl();
		const response = await fetch(`${backendUrl}/api/tutor/assess`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify(body),
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
		console.error("POST /api/tutor/assess proxy:", error);
		return NextResponse.json({ error: "proxy_failed", detail: String(error) }, { status: 500 });
	}
}
