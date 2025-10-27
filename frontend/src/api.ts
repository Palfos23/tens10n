import type {
    QuestionDTO,
    QuestionsWrapper,
    AnswerMap,
    QuestionView,
    AnswerItem,
} from "./types";

// 👇 Hent API-url fra .env
// - Bruk Render-url når den finnes (VITE_API_URL i .env)
// - Fall tilbake til localhost når du kjører lokalt (vite dev)
const API_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/";

// ------------------- HJELPEFUNKSJONER -------------------

function toNumberedList(map?: AnswerMap): AnswerItem[] {
    if (!map) return [];
    return Object.entries(map)
        .map(([k, v]) => [Number(k), v] as const)
        .filter(([, v]) => v && v.trim().length > 0)
        .sort(([a], [b]) => a - b) // behold backend-rekkefølge
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

// ------------------- API-KALL -------------------

/**
 * Hent tilfeldige spørsmål fra backend
 */
export async function fetchRandomQuestions(
    count = 5
): Promise<QuestionView[]> {
    const url = `${API_URL}questions/random?count=${count}`;
    const res = await fetch(url, {
        headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const data = await res.json();
    return normalize(data);
}

/**
 * Hent mulige svaralternativer for en gitt kategori
 */
export async function fetchPossibleAnswers(
    category: string
): Promise<string[]> {
    const url = `${API_URL}answers?category=${encodeURIComponent(category)}`;
    const res = await fetch(url, {
        headers: { Accept: "application/json" },
    });

    if (!res.ok)
        throw new Error(`Failed to fetch possible answers: ${res.statusText}`);

    return await res.json();
}
