import type { Contest, ExamQuestion } from "./types";

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
  return [
    {
      id: "q1",
      content: "Câu 1: 1 + 1 = ?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "math",
      multiSelect: false,
      options: [
        { key: "A", label: "1" },
        { key: "B", label: "2" },
        { key: "C", label: "3" },
        { key: "D", label: "4" },
      ],
    },
    {
      id: "q2",
      content: "Câu 2: Chọn tất cả số nguyên tố.",
      questionType: "MAQ",
      difficulty: "medium",
      topic: "math",
      multiSelect: true,
      options: [
        { key: "A", label: "2" },
        { key: "B", label: "3" },
        { key: "C", label: "4" },
        { key: "D", label: "5" },
      ],
    },
    {
      id: "q3",
      content: "Câu 3: HTTP status code nào là Unauthorized?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "web",
      multiSelect: false,
      options: [
        { key: "A", label: "200" },
        { key: "B", label: "401" },
        { key: "C", label: "404" },
        { key: "D", label: "500" },
      ],
    },
    {
      id: "q4",
      content:
        "Câu 4: Trong JavaScript, toán tử nào dùng để so sánh bằng tuyệt đối (strict equality)?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "js",
      multiSelect: false,
      options: [
        { key: "A", label: "==" },
        { key: "B", label: "=" },
        { key: "C", label: "===" },
        { key: "D", label: "!=" },
      ],
    },
    {
      id: "q5",
      content: "Câu 5: Chọn tất cả các phương thức HTTP an toàn (safe).",
      questionType: "MAQ",
      difficulty: "medium",
      topic: "web",
      multiSelect: true,
      options: [
        { key: "A", label: "GET" },
        { key: "B", label: "HEAD" },
        { key: "C", label: "POST" },
        { key: "D", label: "OPTIONS" },
      ],
    },
    {
      id: "q6",
      content: "Câu 6: SQL keyword nào dùng để lọc dữ liệu?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "sql",
      multiSelect: false,
      options: [
        { key: "A", label: "WHERE" },
        { key: "B", label: "GROUP" },
        { key: "C", label: "ORDER" },
        { key: "D", label: "JOIN" },
      ],
    },
    {
      id: "q7",
      content:
        "Câu 7: Chọn tất cả các loại dữ liệu nguyên thủy (primitive) trong JavaScript.",
      questionType: "MAQ",
      difficulty: "medium",
      topic: "js",
      multiSelect: true,
      options: [
        { key: "A", label: "string" },
        { key: "B", label: "number" },
        { key: "C", label: "object" },
        { key: "D", label: "boolean" },
      ],
    },
    {
      id: "q8",
      content:
        "Câu 8: Git command nào dùng để tạo branch mới và chuyển sang branch đó?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "git",
      multiSelect: false,
      options: [
        { key: "A", label: "git branch" },
        { key: "B", label: "git checkout -b" },
        { key: "C", label: "git merge" },
        { key: "D", label: "git reset" },
      ],
    },
    {
      id: "q9",
      content:
        "Câu 9: React hook nào dùng để quản lý state trong function component?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "react",
      multiSelect: false,
      options: [
        { key: "A", label: "useState" },
        { key: "B", label: "useMemo" },
        { key: "C", label: "useRef" },
        { key: "D", label: "useCallback" },
      ],
    },
    {
      id: "q10",
      content: "Câu 10: Chọn tất cả các cặp (HTTP method, semantics) đúng.",
      questionType: "MAQ",
      difficulty: "hard",
      topic: "web",
      multiSelect: true,
      options: [
        { key: "A", label: "GET - Lấy dữ liệu" },
        { key: "B", label: "POST - Tạo mới" },
        { key: "C", label: "PUT - Cập nhật toàn bộ" },
        { key: "D", label: "DELETE - Xoá" },
      ],
    },
    {
      id: "q11",
      content:
        "Câu 11: Trong Next.js App Router, file nào định nghĩa một route page?",
      questionType: "MCQ",
      difficulty: "medium",
      topic: "nextjs",
      multiSelect: false,
      options: [
        { key: "A", label: "page.tsx" },
        { key: "B", label: "route.ts" },
        { key: "C", label: "layout.tsx" },
        { key: "D", label: "middleware.ts" },
      ],
    },
    {
      id: "q12",
      content: "Câu 12: Chọn tất cả câu đúng về LocalStorage.",
      questionType: "MAQ",
      difficulty: "medium",
      topic: "web",
      multiSelect: true,
      options: [
        { key: "A", label: "Lưu dạng key-value (string)" },
        { key: "B", label: "Chỉ tồn tại trong tab hiện tại" },
        { key: "C", label: "Có thể bị xoá bởi người dùng" },
        { key: "D", label: "Dùng được ở server-side render" },
      ],
    },
    {
      id: "q13",
      content: "Câu 13: Trong SQL, JOIN nào giữ tất cả bản ghi của bảng trái?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "sql",
      multiSelect: false,
      options: [
        { key: "A", label: "INNER JOIN" },
        { key: "B", label: "LEFT JOIN" },
        { key: "C", label: "RIGHT JOIN" },
        { key: "D", label: "CROSS JOIN" },
      ],
    },
    {
      id: "q14",
      content: "Câu 14: Chọn tất cả các kiểu auth phổ biến.",
      questionType: "MAQ",
      difficulty: "easy",
      topic: "auth",
      multiSelect: true,
      options: [
        { key: "A", label: "Session-based" },
        { key: "B", label: "Token/JWT" },
        { key: "C", label: "Basic Auth" },
        { key: "D", label: "IP Whitelisting" },
      ],
    },
    {
      id: "q15",
      content: "Câu 15: 2^5 = ?",
      questionType: "MCQ",
      difficulty: "easy",
      topic: "math",
      multiSelect: false,
      options: [
        { key: "A", label: "16" },
        { key: "B", label: "24" },
        { key: "C", label: "32" },
        { key: "D", label: "64" },
      ],
    },
  ];
}
