-- 1. Bảng Đơn vị (Giữ nguyên, dùng đệ quy cho Khoa/Lớp)
CREATE TABLE "units" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar NOT NULL,
  "code" varchar, -- Mã đơn vị (VD: CNTT, K59)
  "parent_id" uuid REFERENCES "units" ("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now()
);

-- 2. Bảng User (Thêm JSONB metadata & Auth Provider)
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar, -- Nullable vì có thể login Google
  "full_name" varchar,
  "avatar_url" text,
  "role" varchar NOT NULL DEFAULT 'USER', -- 'ADMIN', 'USER'
  "unit_id" uuid REFERENCES "units" ("id"),
  "auth_provider" varchar DEFAULT 'email', -- 'google', 'email'
  "google_id" varchar,
  "metadata" jsonb DEFAULT '{}', -- Lưu: MSSV, Phone, ClassName...
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

-- 3. Bảng Cuộc thi (Thêm cấu hình settings)
CREATE TABLE "contests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar NOT NULL,
  "description" text,
  "thumbnail_url" text,
  "start_time" timestamp,
  "end_time" timestamp,
  "duration_minutes" int, -- Thời gian làm bài (VD: 45 phút)
  "passing_score" decimal DEFAULT 5.0, -- Điểm đạt để cấp chứng chỉ
  "max_attempts" int DEFAULT 1,
  "is_practice" boolean DEFAULT false,
  "status" varchar DEFAULT 'DRAFT', -- 'PUBLISHED', 'HIDDEN'
  "settings" jsonb DEFAULT '{}', -- Lưu: { "shuffle_questions": true, "show_result": false }
  "created_by" uuid REFERENCES "users" ("id"),
  "created_at" timestamp DEFAULT now()
);

-- 4. Bảng Mã dự thi (Giữ nguyên)
CREATE TABLE "contest_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contest_id" uuid REFERENCES "contests" ("id"),
  "code" varchar UNIQUE NOT NULL,
  "is_active" boolean DEFAULT true,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

-- 5. Bảng Câu hỏi (QUAN TRỌNG: Gộp Answers vào đây bằng JSONB)
CREATE TABLE "questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "content" text NOT NULL, -- Nội dung câu hỏi (HTML/Text)
  "question_type" varchar DEFAULT 'MCQ', -- 'MCQ' (1 đáp án), 'MAQ' (Nhiều đáp án)
  "difficulty" varchar DEFAULT 'MEDIUM', -- 'EASY', 'MEDIUM', 'HARD'
  "topic" varchar, -- Chủ đề để lọc
  "options" jsonb NOT NULL, 
  -- Cấu trúc JSONB options:
  -- [
  --   {"id": "a", "text": "Hà Nội", "is_correct": true},
  --   {"id": "b", "text": "HCM", "is_correct": false}
  -- ]
  "created_by" uuid REFERENCES "users" ("id"),
  "created_at" timestamp DEFAULT now()
);

-- 6. Bảng Liên kết Cuộc thi - Câu hỏi (Ngân hàng đề cho cuộc thi)
CREATE TABLE "contest_questions" (
  "contest_id" uuid REFERENCES "contests" ("id") ON DELETE CASCADE,
  "question_id" uuid REFERENCES "questions" ("id") ON DELETE CASCADE,
  "point" decimal DEFAULT 1.0, -- Điểm riêng cho câu này trong cuộc thi này
  PRIMARY KEY ("contest_id", "question_id")
);

-- 7. Bảng Lượt thi (Thêm trạng thái & Draft)
CREATE TABLE "exam_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "users" ("id"),
  "contest_id" uuid REFERENCES "contests" ("id"),
  "started_at" timestamp DEFAULT now(),
  "submitted_at" timestamp,
  "score" decimal DEFAULT 0,
  "duration_seconds" int DEFAULT 0, -- Thời gian thực tế làm bài
  "status" varchar DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED'
  "current_answers" jsonb DEFAULT '{}', -- Lưu nháp: { "q1": "a", "q2": ["a","b"] } (Phục vụ Resume)
  "is_valid" boolean DEFAULT true -- False nếu bị phát hiện gian lận
);

-- 8. Bảng Chi tiết kết quả (Lưu sau khi nộp để thống kê chi tiết)
CREATE TABLE "exam_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "attempt_id" uuid REFERENCES "exam_attempts" ("id") ON DELETE CASCADE,
  "question_id" uuid REFERENCES "questions" ("id"),
  "selected_options" jsonb, -- ["a"] hoặc ["a", "b"]
  "is_correct" boolean,
  "point_earned" decimal
);

-- 9. Bảng Tin tức (Giữ nguyên)
CREATE TABLE "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar NOT NULL,
  "slug" varchar UNIQUE,
  "content" text,
  "thumbnail_url" text,
  "is_featured" boolean DEFAULT false,
  "status" varchar DEFAULT 'PUBLISHED',
  "created_by" uuid REFERENCES "users" ("id"),
  "created_at" timestamp DEFAULT now()
);

-- 10. Bảng Tài liệu (Giữ nguyên)
CREATE TABLE "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar NOT NULL,
  "description" text,
  "type" varchar, -- 'PDF', 'VIDEO', 'SLIDE'
  "file_url" text,
  "external_link" text, -- Link Youtube
  "topic" varchar,
  "created_by" uuid REFERENCES "users" ("id"),
  "created_at" timestamp DEFAULT now()
);

-- 11. Bảng Chứng chỉ (Giữ nguyên)
CREATE TABLE "certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "users" ("id"),
  "contest_id" uuid REFERENCES "contests" ("id"),
  "issued_at" timestamp DEFAULT now(),
  "score" decimal,
  "certificate_code" varchar UNIQUE, -- Mã tra cứu
  "file_url" text
);

-- 12. Bảng Xếp hạng (Leaderboard)
CREATE TABLE "leaderboard" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contest_id" uuid REFERENCES "contests" ("id") ON DELETE CASCADE,
  "user_id" uuid REFERENCES "users" ("id") ON DELETE CASCADE,
  
  -- Denormalization: Lưu luôn unit_id vào đây để query "BXH theo Đơn vị" cực nhanh
  -- Không cần Join ngược lại bảng Users -> Units
  "unit_id" uuid REFERENCES "units" ("id"), 
  
  "total_score" decimal DEFAULT 0,
  "total_time_seconds" int DEFAULT 0, -- Dùng để xét tiêu chí phụ (cùng điểm, ai nhanh hơn xếp trên)
  
  "rank" int, -- Lưu thứ hạng (Optional: Có thể tính toán khi query hoặc lưu cứng khi chốt sổ)
  "updated_at" timestamp DEFAULT now(),
  
  -- Constraint: Mỗi user chỉ có 1 dòng trong BXH của 1 cuộc thi (Lưu kết quả tốt nhất)
  CONSTRAINT "unique_user_contest" UNIQUE ("contest_id", "user_id")
);

-- Index để Sort và Filter nhanh
CREATE INDEX "idx_leaderboard_score_time" ON "leaderboard" ("contest_id", "total_score" DESC, "total_time_seconds" ASC);
CREATE INDEX "idx_leaderboard_unit" ON "leaderboard" ("contest_id", "unit_id");