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
import { Check, Flag } from "lucide-react";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  CountdownTimer,
  computeEndsAtMs,
} from "@/components/exam/countdown-timer";

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
      questionType?.toLowerCase().includes("multi")
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
  questions: ExamQuestion[]
) {
  let count = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a && a.length > 0) count += 1;
  }
  return count;
}

function getDifficultyMeta(
  difficulty?: string
): { label: string; className: string } | null {
  const d = (difficulty ?? "").toLowerCase();

  if (!d) return null;

  if (d.includes("easy")) {
    return {
      label: "Dễ",
      className:
        "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    };
  }

  if (d.includes("medium")) {
    return {
      label: "Trung bình",
      className:
        "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    };
  }

  if (d.includes("hard")) {
    return {
      label: "Khó",
      className:
        "border-red-200 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
    };
  }

  return {
    label: difficulty ?? "",
    className:
      "border-border bg-muted text-foreground dark:border-border dark:bg-muted",
  };
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
            (x): x is Record<string, unknown> => !!x && typeof x === "object"
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
    Math.max(0, questions.length - 1)
  );
  const currentQuestion = questions[currentIndex];

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
    [currentIndex]
  );
  const windowEnd = useMemo(
    () => Math.min(questions.length - 1, windowStart + windowSize - 1),
    [questions.length, windowStart]
  );
  const windowQuestions = useMemo(
    () => questions.slice(windowStart, windowEnd + 1),
    [questions, windowEnd, windowStart]
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
    [persisted.answers, questions]
  );

  const durationSeconds = useMemo(
    () => Math.max(0, (contest?.duration_minutes ?? 30) * 60),
    [contest?.duration_minutes]
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
    [persisted, setPersisted]
  );

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const q = questions[nextIndex];
      if (q) triggerFlash(q.id);
      setCurrentIndex(nextIndex);
    },
    [questions, setCurrentIndex, triggerFlash]
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
    [persisted, setPersisted]
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
    [persisted, setPersisted]
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
    [persisted.answers, setAnswer]
  );

  const handleSubmit = useCallback(
    async (reason: "manual" | "timeout") => {
      toast({
        title: reason === "timeout" ? "Hết giờ" : "Đã nộp bài",
        description:
          dataMode === "mock"
            ? "Đang chạy mock (backend chưa có API nộp bài)."
            : "(Chưa implement API nộp bài trong backend)",
      });

      // For now: keep answers (user can refresh). If you want to clear after submit, uncomment:
      // removeLocalStorageItem(storageKey)

      console.log("submit", { contestId, reason, answers: persisted.answers });
    },
    [contestId, dataMode, persisted.answers, toast]
  );

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
    <div className="h-screen w-full overflow-hidden p-4 lg:p-6">
      <div className="flex h-full flex-col gap-4">
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  dataMode === "mock"
                    ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                )}
              >
                {dataMode === "mock" ? "Mock" : "API"}
              </span>
              <span className="text-xs text-muted-foreground">
                Tự lưu LocalStorage
              </span>
            </div>

            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              {contest.title}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Đã trả lời:</span>
              <span className="font-semibold">
                {answeredCount}/{questions.length}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Đã đặt cờ:{" "}
                {Object.values(persisted.flagged ?? {}).filter(Boolean).length}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="text-base font-semibold text-muted-foreground">
                Thời gian còn lại
              </div>
              <CountdownTimer
                endsAt={endsAt}
                onExpire={() => handleSubmit("timeout")}
                warnAtSeconds={60}
                dangerAtSeconds={10}
                durationSeconds={durationSeconds}
                boxed
                className="text-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => void handleSubmit("manual")}
            >
              Nộp bài
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="flex min-h-0 flex-col shadow-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-lg leading-relaxed">
                <span>
                  {`Đang hiển thị: ${windowStart + 1}-${windowEnd + 1}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 space-y-4 overflow-auto">
              {windowQuestions.map((q, localIdx) => {
                const idx = windowStart + localIdx;
                const flash = q.id === flashQuestionId;
                const selected = persisted.answers[q.id] ?? [];
                const meta = getDifficultyMeta(q.difficulty);
                const isFlagged = Boolean((persisted.flagged ?? {})[q.id]);

                return (
                  <div
                    key={q.id}
                    id={`exam-question-${q.id}`}
                    className={cn(
                      "relative scroll-mt-4 rounded-xl border-2 border-border bg-gradient-to-b from-card to-muted/10 p-4 shadow-sm",
                      flash && "will-change-[border-color,box-shadow]"
                    )}
                    style={
                      flash
                        ? {
                            animation:
                              "exam-question-border-flash 2s ease-in-out 1",
                          }
                        : undefined
                    }
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-primary/40 via-amber-400/30 to-emerald-400/30" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold">
                          Câu {idx + 1}
                        </div>
                        {meta ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                              meta.className
                            )}
                          >
                            {meta.label}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        {q.topic ? (
                          <div
                            className="max-w-[22rem] truncate text-sm text-muted-foreground"
                            title={q.topic}
                          >
                            Chủ đề: {q.topic}
                          </div>
                        ) : null}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFlag(q.id)}
                          className={cn(
                            "transition-colors",
                            isFlagged
                              ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                              : "hover:bg-muted"
                          )}
                        >
                          <Flag
                            className={cn(
                              "size-4",
                              isFlagged && "fill-current"
                            )}
                          />
                          {isFlagged ? "Bỏ cờ" : "Đặt cờ"}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 whitespace-pre-wrap break-words text-lg leading-relaxed [overflow-wrap:anywhere]">
                      {q.content}
                    </div>

                    <div className="mt-4 space-y-2">
                      {q.options.map((opt) => {
                        const checked = selected.includes(opt.key);
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => onSelectOption(q, opt.key)}
                            className={cn(
                              "w-full rounded-xl border px-4 py-4 text-left transition-colors",
                              checked
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-input hover:bg-accent/60"
                            )}
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <div
                                className={cn(
                                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                                  checked
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-background"
                                )}
                              >
                                {checked ? <Check className="h-4 w-4" /> : null}
                              </div>
                              <div className="min-w-0">
                                <div className="whitespace-nowrap font-mono text-sm font-semibold text-muted-foreground">
                                  {opt.key}
                                </div>
                                <div className="whitespace-pre-wrap break-words text-base leading-relaxed [overflow-wrap:anywhere]">
                                  {opt.label}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
                      Math.min(questions.length - 1, currentIndex + windowSize)
                    )
                  }
                  disabled={currentIndex >= questions.length - 1}
                >
                  Sau
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="flex min-h-0 flex-col shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle>Danh sách câu</CardTitle>
              <CardDescription>
                Bấm để chuyển câu (tự lưu LocalStorage)
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-auto">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                    Đã trả lời
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500/70" />
                    Đặt cờ
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    Đang chọn
                  </span>
                </div>

                <div className="rounded-xl border bg-muted/20 p-2">
                  <div className="grid grid-cols-6 gap-2">
                    {questions.map((q, idx) => {
                      const answered =
                        (persisted.answers[q.id]?.length ?? 0) > 0;
                      const active = idx === currentIndex;
                      const inWindow = idx >= windowStart && idx <= windowEnd;
                      const flagged = Boolean((persisted.flagged ?? {})[q.id]);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => goToIndex(idx)}
                          className={cn(
                            "h-10 rounded-md border text-sm transition-colors",
                            active
                              ? flagged
                                ? "border-amber-400 bg-amber-200 text-amber-950"
                                : "border-primary bg-primary text-primary-foreground"
                              : flagged
                              ? "border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/20 dark:hover:bg-amber-950/35"
                              : answered
                              ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35"
                              : "border-input hover:bg-accent",
                            inWindow && !active && "ring-2 ring-primary/25"
                          )}
                          title={
                            flagged
                              ? "Đã đặt cờ"
                              : answered
                              ? "Đã trả lời"
                              : "Chưa trả lời"
                          }
                        >
                          <span className="flex items-center justify-center gap-1">
                            <span>{idx + 1}</span>
                            {flagged ? <Flag className="size-3" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
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
                <Button asChild variant="secondary">
                  <Link href={`/exam/${contestId}`}>Thử API</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary">
                  <Link href={`/exam/${contestId}?mock=1`}>Chạy mock</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
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
    </div>
  );
}
