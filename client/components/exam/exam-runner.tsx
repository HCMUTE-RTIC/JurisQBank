"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { ExamQuestionCard } from "@/components/exam/ExamQuestionCard";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { computeEndsAtMs } from "@/components/exam/countdown-timer";

import type {
  Contest,
  ExamPersistedStateV1,
  ExamQuestion,
  ExamOption,
} from "./types";
import { getMockContest, getMockQuestions } from "./mock";
import { removeLocalStorageItem, useLocalStorageJsonState } from "./storage";

function normalizeOptions(raw: unknown): ExamOption[] {
  if (Array.isArray(raw)) {
    if (raw.every((v) => typeof v === "string")) {
      return (raw as string[]).map((label, idx) => ({
        key: String(idx + 1),
        label,
      }));
    }

    if (raw.every((v) => v && typeof v === "object" && !Array.isArray(v))) {
      return raw.map((opt, idx) => {
        const record = opt as Record<string, unknown>;

        const key =
          record.id ??
          record.key ??
          record.value ??
          record.code ??
          record.label ??
          String(idx + 1);

        const label =
          record.label ?? record.text ?? record.content ?? String(key);

        const isCorrectRaw = record.is_correct ?? record.isCorrect;
        const isCorrect =
          typeof isCorrectRaw === "boolean" ? isCorrectRaw : undefined;

        return { key: String(key), label: String(label), isCorrect };
      });
    }
  }

  if (raw && typeof raw === "object") {
    // e.g. {A: '...', B: '...'}
    const entries = Object.entries(raw as Record<string, unknown>);
    if (entries.length > 0) {
      return entries.map(([key, val]) => ({
        key,
        label: typeof val === "string" ? val : JSON.stringify(val),
      }));
    }
  }

  return [];
}

function mapApiQuestion(raw: Record<string, unknown>): ExamQuestion {
  const questionType = raw?.question_type
    ? String(raw.question_type)
    : undefined;
  const multiSelect = Boolean(
    questionType?.toLowerCase().includes("multiple") ||
    questionType?.toLowerCase().includes("maq") ||
    questionType?.toLowerCase().includes("multi"),
  );

  return {
    id: String(raw?.id ?? ""),
    content: String(raw?.content ?? ""),
    questionType,
    difficulty: raw?.difficulty ? String(raw.difficulty) : undefined,
    topic: raw?.topic ? String(raw.topic) : undefined,
    options: normalizeOptions(raw?.options),
    multiSelect,
  };
}

function formatAnsweredCount(
  answers: Record<string, string[]>,
  questions: ExamQuestion[],
) {
  let count = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a && a.length > 0) count += 1;
  }
  return count;
}

function findFirstUnansweredIndex(
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

function pickRandomUnique<T>(items: T[], count: number): T[] {
  if (count <= 0) return [];
  if (count >= items.length) return [...items];
  const copy = [...items];
  // Fisher–Yates shuffle (partial is fine, but full is ok here)
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function buildRandomAnswersPatch(params: {
  questions: ExamQuestion[];
  existing: Record<string, string[]>;
}): Record<string, string[]> {
  const { questions, existing } = params;
  const next: Record<string, string[]> = { ...existing };

  for (const q of questions) {
    const current = existing[q.id] ?? [];
    if (current.length > 0) continue;

    const optionKeys = q.options.map((o) => o.key).filter(Boolean);
    if (optionKeys.length === 0) continue;

    if (q.multiSelect) {
      const maxPick = Math.min(3, optionKeys.length);
      const pickCount = 1 + Math.floor(Math.random() * maxPick);
      next[q.id] = pickRandomUnique(optionKeys, pickCount);
    } else {
      next[q.id] = [optionKeys[Math.floor(Math.random() * optionKeys.length)]!];
    }
  }

  return next;
}

export function ExamRunner({
  contestId,
  forceMock = false,
}: {
  contestId: string;
  forceMock?: boolean;
}) {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const storageKey = useMemo(() => `exam:${contestId}:v1`, [contestId]);

  const { state: persisted, setState: setPersisted } =
    useLocalStorageJsonState<ExamPersistedStateV1>({
      key: storageKey,
      initial: () => ({
        version: 1,
        startedAtMs: Date.now(),
        currentIndex: 0,
        answers: {},
        flagged: {},
      }),
    });

  const [contest, setContest] = useState<Contest | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [dataMode, setDataMode] = useState<"api" | "mock">("api");
  const [loading, setLoading] = useState(true);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmRandomOpen, setConfirmRandomOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(true);

  const closeSubmitConfirm = useCallback(() => setConfirmSubmitOpen(false), []);
  const closeRandomConfirm = useCallback(() => setConfirmRandomOpen(false), []);

  // Anti-cheat: Tab Switch Detection
  const visibilityChange = useCallback(() => {
    if (document.hidden) {
      setVisible(false);
      toast({
        title: "Cảnh báo",
        variant: "destructive",
        description:
          "Bạn đã chuyển tab hoặc ẩn cửa sổ trình duyệt. Vui lòng quay lại tab này để tiếp tục làm bài.",
      });
    } else {
      setVisible(true);
    }
  }, [toast]);

  useEffect(() => {
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, [visibilityChange]);


  const persistedRef = useRef(persisted);
  useEffect(() => {
    persistedRef.current = persisted;
  }, [persisted]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (forceMock) {
        if (!cancelled) {
          setContest(getMockContest(contestId));
          setQuestions(getMockQuestions());
          setDataMode("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const contestResp = await api.get(`/contests/${contestId}/`);
        const contestData = contestResp.data as Contest;

        // Try common patterns for contest questions (backend may add later)
        let qData: unknown[] | null = null;

        try {
          const qResp = await api.get(`/contests/${contestId}/questions/`);
          qData = Array.isArray(qResp.data)
            ? (qResp.data as unknown[])
            : (qResp.data?.results as unknown[]);
        } catch {
          try {
            const qResp = await api.get(`/questions/?contest=${contestId}`);
            qData = Array.isArray(qResp.data)
              ? (qResp.data as unknown[])
              : (qResp.data?.results as unknown[]);
          } catch {
            qData = null;
          }
        }

        if (!qData || qData.length === 0) {
          if (!cancelled) {
            setContest(contestData);
            setQuestions(getMockQuestions());
            setDataMode("mock");
            setLoading(false);
          }
          return;
        }

        const mapped = qData
          .filter(
            (x): x is Record<string, unknown> => !!x && typeof x === "object",
          )
          .map(mapApiQuestion)
          .filter((q) => q.id && q.content);

        if (!cancelled) {
          setContest(contestData);
          setQuestions(mapped);
          setDataMode("api");
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setContest(getMockContest(contestId));
          setQuestions(getMockQuestions());
          setDataMode("mock");
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [contestId, forceMock]);

  const currentIndex = Math.min(
    Math.max(0, persisted.currentIndex),
    Math.max(0, questions.length - 1),
  );

  const [flashQuestionId, setFlashQuestionId] = useState<string | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const triggerFlash = useCallback((questionId: string) => {
    // Force restart animation even if the same question is clicked again.
    setFlashQuestionId(null);
    window.requestAnimationFrame(() => {
      setFlashQuestionId(questionId);
    });

    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }

    flashTimerRef.current = window.setTimeout(() => {
      setFlashQuestionId((prev) => (prev === questionId ? null : prev));
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const windowSize = 5;
  const windowStart = useMemo(
    () => Math.floor(currentIndex / windowSize) * windowSize,
    [currentIndex],
  );
  const windowEnd = useMemo(
    () => Math.min(questions.length - 1, windowStart + windowSize - 1),
    [questions.length, windowStart],
  );
  const windowQuestions = useMemo(
    () => questions.slice(windowStart, windowEnd + 1),
    [questions, windowEnd, windowStart],
  );

  useEffect(() => {
    const q = questions[currentIndex];
    if (!q) return;

    triggerFlash(q.id);

    const el = document.getElementById(`exam-question-${q.id}`);
    if (!el) return;

    // Let the DOM paint first (esp. when switching between 5-question windows)
    window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [currentIndex, questions, triggerFlash, windowStart]);

  const answeredCount = useMemo(
    () => formatAnsweredCount(persisted.answers, questions),
    [persisted.answers, questions],
  );

  const flaggedCount = useMemo(
    () => Object.values(persisted.flagged ?? {}).filter(Boolean).length,
    [persisted.flagged],
  );

  const durationSeconds = useMemo(
    () => Math.max(0, (contest?.duration_minutes ?? 30) * 60),
    [contest?.duration_minutes],
  );

  const endsAt = useMemo(() => {
    return computeEndsAtMs({
      startedAt: persisted.startedAtMs,
      durationSeconds,
    });
  }, [durationSeconds, persisted.startedAtMs]);

  const setCurrentIndex = useCallback(
    (nextIndex: number) => {
      setPersisted({
        ...persisted,
        currentIndex: nextIndex,
      });
    },
    [persisted, setPersisted],
  );

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const q = questions[nextIndex];
      if (q) triggerFlash(q.id);
      setCurrentIndex(nextIndex);
    },
    [questions, setCurrentIndex, triggerFlash],
  );

  const setAnswer = useCallback(
    (questionId: string, next: string[]) => {
      setPersisted({
        ...persisted,
        answers: {
          ...persisted.answers,
          [questionId]: next,
        },
      });
    },
    [persisted, setPersisted],
  );

  const toggleFlag = useCallback(
    (questionId: string) => {
      const current = persisted.flagged ?? {};
      const next = {
        ...current,
        [questionId]: !current[questionId],
      };
      setPersisted({
        ...persisted,
        flagged: next,
      });
    },
    [persisted, setPersisted],
  );

  const onSelectOption = useCallback(
    (question: ExamQuestion, optionKey: string) => {
      const existing = persisted.answers[question.id] ?? [];
      if (question.multiSelect) {
        const has = existing.includes(optionKey);
        const next = has
          ? existing.filter((k) => k !== optionKey)
          : [...existing, optionKey];
        setAnswer(question.id, next);
      } else {
        // Single-choice: clicking the selected option again will unselect it.
        const has = existing.includes(optionKey);
        setAnswer(question.id, has ? [] : [optionKey]);
      }
    },
    [persisted.answers, setAnswer],
  );

  const applyRandomAnswers = useCallback(() => {
    if (submitting || submitted) return;

    const current = persistedRef.current;
    const nextAnswers = buildRandomAnswersPatch({
      questions,
      existing: current.answers,
    });

    setPersisted({
      ...current,
      answers: nextAnswers,
    });

    const firstUnansweredAfter = findFirstUnansweredIndex(
      nextAnswers,
      questions,
    );

    toast({
      title: "Đã chọn ngẫu nhiên đáp án",
      description:
        firstUnansweredAfter === null
          ? "Tất cả câu đã có đáp án."
          : "Một số câu vẫn chưa có đáp án (thiếu options).",
    });

    if (firstUnansweredAfter !== null) {
      goToIndex(firstUnansweredAfter);
    }
  }, [goToIndex, questions, setPersisted, submitted, submitting, toast]);

  const handleRandomAnswersClick = useCallback(() => {
    if (submitting || submitted) return;
    setConfirmSubmitOpen(false);
    setConfirmRandomOpen(true);
  }, [submitted, submitting]);

  const confirmRandomAnswers = useCallback(() => {
    closeRandomConfirm();
    applyRandomAnswers();
  }, [applyRandomAnswers, closeRandomConfirm]);

  const handleSubmit = useCallback(
    async (reason: "manual" | "timeout") => {
      if (submitting || submitted) return;

      if (reason === "timeout") {
        // If time's up, always submit immediately (even if unfinished).
        closeRandomConfirm();
        closeSubmitConfirm();
      }

      setSubmitting(true);
      toast({
        title: reason === "timeout" ? "Hết giờ" : "Đã nộp bài",
        description:
          dataMode === "mock"
            ? "Đang chạy mock (backend chưa có API nộp bài)."
            : "(Chưa implement API nộp bài trong backend)",
      });

      // For now: keep answers (user can refresh). If you want to clear after submit, uncomment:
      // removeLocalStorageItem(storageKey)

      try {
        const latestAnswers = persistedRef.current.answers;
        console.log("submit", {
          contestId,
          reason,
          answers: latestAnswers,
        });
        setSubmitted(true);
      } finally {
        setSubmitting(false);
      }
    },
    [contestId, dataMode, submitted, submitting, toast],
  );

  const handleManualSubmitClick = useCallback(() => {
    const firstUnanswered = findFirstUnansweredIndex(
      persisted.answers,
      questions,
    );

    if (firstUnanswered !== null) {
      toast({
        title: "Bạn chưa làm hết",
        description: `Chuyển tới câu chưa trả lời đầu tiên (câu ${
          firstUnanswered + 1
        }).`,
      });
      goToIndex(firstUnanswered);
      return;
    }

    setConfirmRandomOpen(false);
    setConfirmSubmitOpen(true);
  }, [goToIndex, persisted.answers, questions, toast]);

  const confirmManualSubmit = useCallback(async () => {
    setConfirmSubmitting(true);
    try {
      await handleSubmit("manual");
      closeSubmitConfirm();
    } finally {
      setConfirmSubmitting(false);
    }
  }, [closeSubmitConfirm, handleSubmit]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải...</CardTitle>
            <CardDescription>Chuẩn bị đề thi</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Bạn chưa đăng nhập</CardTitle>
            <CardDescription>
              Vui lòng đăng nhập để bắt đầu làm bài.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/login">Đi tới trang đăng nhập</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!contest || questions.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Không có dữ liệu đề thi</CardTitle>
            <CardDescription>
              Không tải được contest/câu hỏi. Thử lại hoặc bật mock.
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                removeLocalStorageItem(storageKey);
                window.location.reload();
              }}
            >
              Reset local data
            </Button>
            <Button asChild>
              <Link href={`/exam/${contestId}?mock=1`}>Chạy mock</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 p-4 lg:p-6">
      <div className="flex h-[calc(100dvh-2rem)] flex-col gap-4 lg:h-[calc(100dvh-3rem)]">
        <ExamHeader
          contest={contest}
          dataMode={dataMode}
          answeredCount={answeredCount}
          total={questions.length}
          flaggedCount={flaggedCount}
          endsAt={endsAt}
          durationSeconds={durationSeconds}
          onTimeout={() => handleSubmit("timeout")}
          onSubmitClick={handleManualSubmitClick}
          submitting={submitting}
          submitted={submitted}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="relative flex min-h-0 flex-col overflow-hidden border-primary/10 bg-card/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55 lg:col-span-3">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg leading-relaxed">
                <span>{`Câu ${currentIndex + 1}/${questions.length}`}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {`Đang hiển thị: ${windowStart + 1}-${windowEnd + 1}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 space-y-4 overflow-auto">
              {windowQuestions.map((q, localIdx) => {
                const idx = windowStart + localIdx;
                const flash = q.id === flashQuestionId;
                const selected = persisted.answers[q.id] ?? [];
                const isFlagged = Boolean((persisted.flagged ?? {})[q.id]);

                return (
                  <ExamQuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    selected={selected}
                    flagged={isFlagged}
                    flash={flash}
                    onSelectOption={onSelectOption}
                    onToggleFlag={toggleFlag}
                  />
                );
              })}
            </CardContent>

            <CardFooter className="flex flex-wrap justify-end gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    goToIndex(Math.max(0, currentIndex - windowSize))
                  }
                  disabled={currentIndex === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    goToIndex(
                      Math.min(questions.length - 1, currentIndex + windowSize),
                    )
                  }
                  disabled={currentIndex >= questions.length - 1}
                >
                  Sau
                </Button>
              </div>
            </CardFooter>
          </Card>

          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            windowStart={windowStart}
            windowEnd={windowEnd}
            answers={persisted.answers}
            flagged={persisted.flagged ?? {}}
            onGoToIndex={goToIndex}
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    removeLocalStorageItem(storageKey);
                    window.location.reload();
                  }}
                >
                  Reset
                </Button>
                {dataMode === "mock" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRandomAnswersClick}
                    disabled={submitting || submitted}
                  >
                    Random đáp án
                  </Button>
                ) : (
                  <Button asChild variant="secondary">
                    <Link href={`/exam/${contestId}?mock=1`}>Chạy mock</Link>
                  </Button>
                )}
              </>
            }
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes exam-question-border-flash {
          0% {
            border-color: var(--border);
            box-shadow: 0 0 0 0 transparent;
          }
          50% {
            border-color: var(--primary);
            box-shadow: 0 0 0 4px
              color-mix(in oklch, var(--primary) 25%, transparent);
          }
          100% {
            border-color: var(--border);
            box-shadow: 0 0 0 0 transparent;
          }
        }
      `}</style>

      <ConfirmModal
        open={confirmRandomOpen}
        title="Xác nhận chọn ngẫu nhiên"
        description="Bạn có muốn hệ thống tự chọn ngẫu nhiên đáp án cho các câu bạn chưa làm không?"
        confirmText="Có, chọn ngẫu nhiên"
        confirmVariant="secondary"
        onClose={closeRandomConfirm}
        onConfirm={confirmRandomAnswers}
      />

      <ConfirmModal
        open={confirmSubmitOpen}
        title="Xác nhận nộp bài"
        description="Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, bạn có thể không sửa đáp án nữa."
        confirmText={confirmSubmitting ? "Đang nộp..." : "Có, nộp bài"}
        confirmVariant="destructive"
        confirmDisabled={confirmSubmitting}
        cancelDisabled={confirmSubmitting}
        onClose={closeSubmitConfirm}
        onConfirm={() => void confirmManualSubmit()}
      />
    </div>
  );
}
