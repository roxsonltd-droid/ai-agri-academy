import { NextRequest, NextResponse } from "next/server";

import { serverBackendBaseUrl } from "@/lib/server-backend-url";

/** Proxies to FastAPI `POST /api/tutor/chat` (RAG + Academy content). */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const question = typeof body.question === "string" ? body.question : "";
		const userId = typeof body.userId === "string" ? body.userId : typeof body.user_id === "string" ? body.user_id : "anonymous";
		const culture = typeof body.culture === "string" ? body.culture : undefined;
		const region = typeof body.region === "string" ? body.region : undefined;

		if (!question.trim()) {
			return NextResponse.json({ error: "question_required" }, { status: 400 });
		}

		const backendUrl = serverBackendBaseUrl();
		const response = await fetch(`${backendUrl}/api/tutor/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify({
				question: question.trim(),
				user_id: userId,
				culture: culture || null,
				region: region || null,
			}),
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
		console.error("POST /api/tutor/chat proxy:", error);
		return NextResponse.json({ error: "proxy_failed", detail: String(error) }, { status: 500 });
	}
}
