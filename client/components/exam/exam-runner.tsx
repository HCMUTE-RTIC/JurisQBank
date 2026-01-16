"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

  const clearAnswer = useCallback(
    (questionId: string) => {
      const nextAnswers = { ...persisted.answers };
      delete nextAnswers[questionId];
      setPersisted({ ...persisted, answers: nextAnswers });
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
        setAnswer(question.id, [optionKey]);
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

  const selectedKeys = currentQuestion
    ? persisted.answers[currentQuestion.id] ?? []
    : [];

  return (
    <div className="min-h-screen w-full p-4 lg:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 lg:min-h-[calc(100vh-3rem)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {dataMode === "mock" ? "Data: mock" : "Data: api"}
            </div>
            <h1 className="text-xl font-semibold">{contest.title}</h1>
            <div className="text-sm text-muted-foreground">
              Đã trả lời: {answeredCount}/{questions.length}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 lg:justify-end">
            <div className="flex flex-1 justify-center">
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

            <Button
              variant="destructive"
              onClick={() => void handleSubmit("manual")}
            >
              Nộp bài
            </Button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
          <Card className="flex min-h-0 flex-col lg:col-span-3">
            <CardHeader>
              <CardTitle>
                Câu {currentIndex + 1}/{questions.length}
              </CardTitle>
              <CardDescription>
                {currentQuestion.topic
                  ? `Chủ đề: ${currentQuestion.topic}`
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 space-y-4 overflow-auto">
              <div className="whitespace-pre-wrap text-base">
                {currentQuestion.content}
              </div>

              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const checked = selectedKeys.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onSelectOption(currentQuestion, opt.key)}
                      className={cn(
                        "w-full rounded-lg border px-4 py-3 text-left transition",
                        checked
                          ? "border-primary bg-primary/10"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 h-5 w-5 shrink-0 rounded-sm border",
                            checked
                              ? "border-primary bg-primary"
                              : "border-input"
                          )}
                        />
                        <div>
                          <div className="font-mono text-sm text-muted-foreground">
                            {opt.key}
                          </div>
                          <div className="text-sm">{opt.label}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentIndex(
                      Math.min(questions.length - 1, currentIndex + 1)
                    )
                  }
                  disabled={currentIndex >= questions.length - 1}
                >
                  Sau
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => clearAnswer(currentQuestion.id)}
                  disabled={selectedKeys.length === 0}
                >
                  Xoá đáp án
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="flex min-h-0 flex-col lg:col-span-1">
            <CardHeader>
              <CardTitle>Danh sách câu</CardTitle>
              <CardDescription>
                Bấm để chuyển câu (tự lưu LocalStorage)
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-auto">
              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const answered = (persisted.answers[q.id]?.length ?? 0) > 0;
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "h-10 rounded-md border text-sm",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : answered
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-input hover:bg-accent"
                      )}
                      title={answered ? "Đã trả lời" : "Chưa trả lời"}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
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
    </div>
  );
}
