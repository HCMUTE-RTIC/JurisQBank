export type ExamOption = {
  key: string;
  label: string;
  /** Optional: available when loading from BE (options JSONB contains is_correct). */
  isCorrect?: boolean;
};

export type ExamQuestion = {
  id: string;
  content: string;
  questionType?: string;
  difficulty?: string;
  topic?: string;
  options: ExamOption[];
  multiSelect: boolean;
};

export type Contest = {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;

  passing_score?: number;
  max_attempts?: number;
  is_practice?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "HIDDEN" | (string & {});

  /** Contest settings stored in JSONB on backend (e.g. { shuffle_questions: true, show_result: false }). */
  settings?: Record<string, unknown>;

  created_by?: string;
  created_at?: string;
};

export type ExamPersistedStateV1 = {
  version: 1;
  startedAtMs: number;
  currentIndex: number;
  answers: Record<string, string[]>; // questionId -> option keys (length 1 for single-choice)
};
