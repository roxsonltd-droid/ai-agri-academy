/**
 * Форма на `POST /api/quiz/generate` (съвместима с FastAPI `GeneratedQuiz.model_dump(mode="json")`).
 */
export type QuizOptionJson = {
	text: string;
	is_correct: boolean;
};

export type QuizQuestionJson = {
	id: number;
	question_text: string;
	question_type: "multiple_choice" | "true_false" | "open_ended";
	options?: QuizOptionJson[] | null;
	correct_answer: string;
	explanation: string;
	difficulty: string;
	topic: string;
};

export type GeneratedQuizJson = {
	topic: string;
	difficulty: string;
	total_questions: number;
	questions: QuizQuestionJson[];
	estimated_time_minutes: number;
	learning_objectives: string[];
	generated_at?: string;
};

export function isGeneratedQuizJson(v: unknown): v is GeneratedQuizJson {
	if (!v || typeof v !== "object") return false;
	const o = v as Record<string, unknown>;
	return (
		typeof o.topic === "string" &&
		Array.isArray(o.questions) &&
		o.questions.every(
			(q) =>
				q &&
				typeof q === "object" &&
				typeof (q as QuizQuestionJson).question_text === "string" &&
				typeof (q as QuizQuestionJson).question_type === "string",
		)
	);
}
