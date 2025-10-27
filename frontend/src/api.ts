import type {
  QuestionDTO,
  QuestionsWrapper,
  AnswerMap,
  QuestionView,
  AnswerItem,
} from "./types";

function toNumberedList(map?: AnswerMap): AnswerItem[] {
  if (!map) return [];
  return Object.entries(map)
    .map(([k, v]) => [Number(k), v] as const)
    .filter(([, v]) => v && v.trim().length > 0)
    .sort(([a], [b]) => a - b) // keep BE order
    .map(([index, text]) => ({ index, text }));
}

function normalize(input: QuestionsWrapper | QuestionDTO[]): QuestionView[] {
  const list = Array.isArray(input) ? input : input.questions ?? [];
  return list.map((q) => ({
    questionId: q.questionId,
    title: q.title,
    answers: toNumberedList(q.answers),
    tensionAnswers: toNumberedList(q.tensionAnswers),
    answersCategory: q.answersCategory,
  }));
}

export async function fetchRandomQuestions(count = 5): Promise<QuestionView[]> {
  const res = await fetch(
    `http://localhost:8080/api/questions/random?count=${count}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return normalize(data);
}

export async function fetchPossibleAnswers(category: string): Promise<string[]> {
    const res = await fetch(
        `http://localhost:8080/api/answers?category=${encodeURIComponent(category)}`
    );
    if (!res.ok) throw new Error(`Failed to fetch possible answers: ${res.statusText}`);
    return await res.json();
}


