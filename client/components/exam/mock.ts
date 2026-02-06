import type { Contest, ExamQuestion, ExamOption } from "./types";

type MockQuestionOptionRow = {
  id: string;
  text: string;
  is_correct: boolean;
};

type MockQuestionRow = {
  id: string;
  content: string;
  question_type: string;
  difficulty: string;
  topic?: string;
  options: MockQuestionOptionRow[];
  created_by: string;
  created_at: string;
};

export function getMockContest(contestId: string): Contest {
  return {
    id: contestId,
    title: "Mock Contest",
    description:
      "Backend chưa có API lấy câu hỏi theo contest. Đây là dữ liệu mock để chạy UI.",
    duration_minutes: 30,
    passing_score: 5.0,
    max_attempts: 1,
    is_practice: false,
    status: "PUBLISHED",
    settings: {
      shuffle_questions: true,
      show_result: false,
    },
  };
}

export function getMockQuestions(): ExamQuestion[] {
  const mockQuestions: MockQuestionRow[] = [
    {
      id: "q1",
      content:
        "Câu 1: 1 + 1 = dáàádfmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "math",
      options: [
        {
          id: "A",
          text: "1dsaaâddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddđ",
          is_correct: false,
        },
        { id: "B", text: "2", is_correct: true },
        { id: "C", text: "3", is_correct: false },
        { id: "D", text: "4", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000001",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q2",
      content: "Câu 2: Chọn tất cả số nguyên tố.",
      question_type: "MAQ",
      difficulty: "MEDIUM",
      topic: "math",
      options: [
        { id: "A", text: "2", is_correct: true },
        { id: "B", text: "3", is_correct: true },
        { id: "C", text: "4", is_correct: false },
        { id: "D", text: "5", is_correct: true },
      ],
      created_by: "00000000-0000-0000-0000-000000000002",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q3",
      content: "Câu 3: HTTP status code nào là Unauthorized?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "web",
      options: [
        { id: "A", text: "200", is_correct: false },
        { id: "B", text: "401", is_correct: true },
        { id: "C", text: "404", is_correct: false },
        { id: "D", text: "500", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000003",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q4",
      content:
        "Câu 4: Trong JavaScript, toán tử nào dùng để so sánh bằng tuyệt đối (strict equality)?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "js",
      options: [
        { id: "A", text: "==", is_correct: false },
        { id: "B", text: "=", is_correct: false },
        { id: "C", text: "===", is_correct: true },
        { id: "D", text: "!=", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000004",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q5",
      content: "Câu 5: Chọn tất cả các phương thức HTTP an toàn (safe).",
      question_type: "MAQ",
      difficulty: "MEDIUM",
      topic: "web",
      options: [
        { id: "A", text: "GET", is_correct: true },
        { id: "B", text: "HEAD", is_correct: true },
        { id: "C", text: "POST", is_correct: false },
        { id: "D", text: "OPTIONS", is_correct: true },
      ],
      created_by: "00000000-0000-0000-0000-000000000005",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q6",
      content: "Câu 6: SQL keyword nào dùng để lọc dữ liệu?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "sql",
      options: [
        { id: "A", text: "WHERE", is_correct: true },
        { id: "B", text: "GROUP", is_correct: false },
        { id: "C", text: "ORDER", is_correct: false },
        { id: "D", text: "JOIN", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000006",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q7",
      content:
        "Câu 7: Chọn tất cả các loại dữ liệu nguyên thủy (primitive) trong JavaScript.",
      question_type: "MAQ",
      difficulty: "MEDIUM",
      topic: "js",
      options: [
        { id: "A", text: "string", is_correct: true },
        { id: "B", text: "number", is_correct: true },
        { id: "C", text: "object", is_correct: false },
        { id: "D", text: "boolean", is_correct: true },
      ],
      created_by: "00000000-0000-0000-0000-000000000007",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q8",
      content:
        "Câu 8: Git command nào dùng để tạo branch mới và chuyển sang branch đó?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "git",
      options: [
        { id: "A", text: "git branch", is_correct: false },
        { id: "B", text: "git checkout -b", is_correct: true },
        { id: "C", text: "git merge", is_correct: false },
        { id: "D", text: "git reset", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000008",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q9",
      content:
        "Câu 9: React hook nào dùng để quản lý state trong function component?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "react",
      options: [
        { id: "A", text: "useState", is_correct: true },
        { id: "B", text: "useMemo", is_correct: false },
        { id: "C", text: "useRef", is_correct: false },
        { id: "D", text: "useCallback", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000009",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q10",
      content: "Câu 10: Chọn tất cả các cặp (HTTP method, semantics) đúng.",
      question_type: "MAQ",
      difficulty: "HARD",
      topic: "web",
      options: [
        { id: "A", text: "GET - Lấy dữ liệu", is_correct: true },
        { id: "B", text: "POST - Tạo mới", is_correct: true },
        { id: "C", text: "PUT - Cập nhật toàn bộ", is_correct: true },
        { id: "D", text: "DELETE - Xoá", is_correct: true },
      ],
      created_by: "00000000-0000-0000-0000-000000000010",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q11",
      content:
        "Câu 11: Trong Next.js App Router, file nào định nghĩa một route page?",
      question_type: "MCQ",
      difficulty: "MEDIUM",
      topic: "nextjs",
      options: [
        { id: "A", text: "page.tsx", is_correct: true },
        { id: "B", text: "route.ts", is_correct: false },
        { id: "C", text: "layout.tsx", is_correct: false },
        { id: "D", text: "middleware.ts", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000011",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q12",
      content: "Câu 12: Chọn tất cả câu đúng về LocalStorage.",
      question_type: "MAQ",
      difficulty: "MEDIUM",
      topic: "web",
      options: [
        { id: "A", text: "Lưu dạng key-value (string)", is_correct: true },
        { id: "B", text: "Chỉ tồn tại trong tab hiện tại", is_correct: false },
        { id: "C", text: "Có thể bị xoá bởi người dùng", is_correct: true },
        { id: "D", text: "Dùng được ở server-side render", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000012",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q13",
      content: "Câu 13: Trong SQL, JOIN nào giữ tất cả bản ghi của bảng trái?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "sql",
      options: [
        { id: "A", text: "INNER JOIN", is_correct: false },
        { id: "B", text: "LEFT JOIN", is_correct: true },
        { id: "C", text: "RIGHT JOIN", is_correct: false },
        { id: "D", text: "CROSS JOIN", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000013",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q14",
      content: "Câu 14: Chọn tất cả các kiểu auth phổ biến.",
      question_type: "MAQ",
      difficulty: "EASY",
      topic: "auth",
      options: [
        { id: "A", text: "Session-based", is_correct: true },
        { id: "B", text: "Token/JWT", is_correct: true },
        { id: "C", text: "Basic Auth", is_correct: true },
        { id: "D", text: "IP Whitelisting", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000014",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q15",
      content: "Câu 15: 2^5 = ?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "math",
      options: [
        { id: "A", text: "16", is_correct: false },
        { id: "B", text: "24", is_correct: false },
        { id: "C", text: "32", is_correct: true },
        { id: "D", text: "64", is_correct: false },
      ],
      created_by: "00000000-0000-0000-0000-000000000015",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q16",
      content: "Câu 16: Chọn tất cả phát biểu đúng về REST API.",
      question_type: "MAQ",
      difficulty: "MEDIUM",
      topic: "web",
      options: [
        {
          id: "A",
          text: "Resource thường được biểu diễn qua URL",
          is_correct: true,
        },
        { id: "B", text: "GET dùng để thay đổi dữ liệu", is_correct: false },
        { id: "C", text: "POST thường dùng để tạo mới", is_correct: true },
        {
          id: "D",
          text: "HTTP status code thể hiện kết quả xử lý",
          is_correct: true,
        },
      ],
      created_by: "00000000-0000-0000-0000-000000000016",
      created_at: "2026-02-06T10:00:00Z",
    },
    {
      id: "q17",
      content: "Câu 17: Trong Python, cấu trúc dữ liệu nào là immutable?",
      question_type: "MCQ",
      difficulty: "EASY",
      topic: "python",
      options: [
        { id: "A", text: "list", is_correct: false },
        { id: "B", text: "dict", is_correct: false },
        { id: "C", text: "set", is_correct: false },
        { id: "D", text: "tuple", is_correct: true },
      ],
      created_by: "00000000-0000-0000-0000-000000000017",
      created_at: "2026-02-06T10:00:00Z",
    },
  ];

  const toExamOptions = (options: MockQuestionOptionRow[]): ExamOption[] =>
    options.map((opt) => ({
      key: opt.id,
      label: opt.text,
      isCorrect: opt.is_correct,
    }));

  return mockQuestions.map((q) => {
    const questionType = String(q.question_type ?? "");
    const multiSelect = Boolean(
      questionType.toLowerCase().includes("multiple") ||
      questionType.toLowerCase().includes("maq") ||
      questionType.toLowerCase().includes("multi"),
    );

    return {
      id: q.id,
      content: q.content,
      questionType,
      difficulty: q.difficulty,
      topic: q.topic,
      options: toExamOptions(q.options),
      multiSelect,
    };
  });
}
