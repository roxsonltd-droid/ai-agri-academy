"""Оценка на квиз и кратки съобщения за прогрес."""


def calculate_score(answers: list[bool]) -> float:
    """Дял верни отговори 0.0–1.0."""
    if not answers:
        return 0.0
    return sum(1 for a in answers if a) / len(answers)


def bump_mastery(old_mastery: float, score_ratio: float, step: float = 0.15) -> float:
    """Увеличава mastery пропорционално на резултата (cap 1.0)."""
    return min(1.0, float(old_mastery) + float(score_ratio) * step)


def feedback_message_for_mastery(new_mastery: float) -> str:
    if new_mastery > 0.85:
        return "Отличен прогрес! Готов си за по-сложни теми."
    if new_mastery > 0.6:
        return "Добър напредък. Продължаваме."
    return "Нека преговорим основите."
