// Raw backend shapes (optional to export)
export type AnswerMap = Record<string, string>;

export interface QuestionDTO {
  questionId: string;
  title: string;
  numTensionAnswers: number;
  answers: AnswerMap;
  tensionAnswers: AnswerMap;
  answersCategory: string;
}

export interface QuestionsWrapper {
  questions: QuestionDTO[];
}

// ---- UI/View types (what your React components use) ----
export interface AnswerItem {
  index: number; // numeric order from backend key (1..15)
  text: string;
}

export interface QuestionView {
  questionId: string;
  title: string;
  answers: AnswerItem[];
  tensionAnswers: AnswerItem[];
  answersCategory: string;
}
