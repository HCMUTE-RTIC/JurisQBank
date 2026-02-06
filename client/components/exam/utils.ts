import type { ExamQuestion } from "./types";

/**
 * Check if user's answers for a question are correct
 * @returns { isCorrect: boolean, isWrong: boolean, isSkipped: boolean }
 */
export function checkAnswerResult(
  question: ExamQuestion,
  userAnswers: string[],
): { isCorrect: boolean; isWrong: boolean; isSkipped: boolean } {
  if (!userAnswers || userAnswers.length === 0) {
    return { isCorrect: false, isWrong: false, isSkipped: true };
  }

  const correctKeys = question.options
    .filter((o) => o.isCorrect === true)
    .map((o) => o.key);

  const userSorted = [...userAnswers].sort();
  const correctSorted = [...correctKeys].sort();

  const isCorrect =
    userSorted.length === correctSorted.length &&
    userSorted.every((k, i) => k === correctSorted[i]);

  return {
    isCorrect,
    isWrong: !isCorrect,
    isSkipped: false,
  };
}

/**
 * Count answered questions
 */
export function countAnswered(
  answers: Record<string, string[]>,
  questions: ExamQuestion[],
): number {
  let count = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a && a.length > 0) count += 1;
  }
  return count;
}

/**
 * Find first unanswered question index
 */
export function findFirstUnansweredIndex(
  answers: Record<string, string[]>,
  questions: ExamQuestion[],
): number | null {
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    const selected = answers[q.id];
    if (!selected || selected.length === 0) return i;
  }
  return null;
}
