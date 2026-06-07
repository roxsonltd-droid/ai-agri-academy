import { useState, useCallback } from "react";

type TutorSource = {
	source?: string;
	topic?: string;
	course?: string;
	lecture_id?: string;
	chunk_index?: number | null;
	score?: number;
	distance?: number | null;
};

type TutorRetrieval = {
	backend?: string;
	top_k?: number;
	document_count?: number;
	course_filter?: string | null;
};

type TutorMessage = {
	role: "user" | "assistant";
	content: string;
	sources?: TutorSource[];
	retrieval?: TutorRetrieval;
};

type TutorChatResponse = {
	answer?: string;
	sources?: TutorSource[];
	retrieval?: TutorRetrieval;
};

export function useTutor(userId: string) {
	const [messages, setMessages] = useState<TutorMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [threadId] = useState(`chat_${userId}`);

	const sendMessage = useCallback(
		async (question: string, mode = "general", opts?: { culture?: string; region?: string }) => {
			setIsLoading(true);

			try {
				const res = await fetch("/api/tutor/chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						question,
						userId,
						threadId,
						mode,
						culture: opts?.culture ?? "",
						region: opts?.region ?? "",
					}),
				});

				const data = (await res.json()) as TutorChatResponse;

				setMessages((prev) => [
					...prev,
					{ role: "user", content: question },
					{
						role: "assistant",
						content: typeof data.answer === "string" ? data.answer : "",
						sources: Array.isArray(data.sources) ? data.sources : [],
						retrieval: data.retrieval,
					},
				]);

				setIsLoading(false);
				return data;
			} catch (error) {
				console.error("Error sending message to tutor:", error);
				setIsLoading(false);
				return null;
			}
		},
		[userId, threadId],
	);

	return { messages, sendMessage, isLoading, threadId };
}
