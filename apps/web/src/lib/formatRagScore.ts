/** Форматира RAG score (косинусна сходност): в [0,1] като процент, иначе като число. */
export function formatRagScore(score: number): string {
	if (!Number.isFinite(score)) return "";
	if (score >= 0 && score <= 1) return `${Math.round(score * 100)}%`;
	return score.toFixed(3);
}
