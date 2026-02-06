"use client";

import React from "react";

import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ExamQuestion } from "./types";

export type QuestionNavigatorProps = {
  questions: ExamQuestion[];
  currentIndex: number;
  windowStart: number;
  windowEnd: number;
  answers: Record<string, string[]>;
  flagged: Record<string, boolean>;
  onGoToIndex: (index: number) => void;
  footer?: React.ReactNode;
  reviewMode?: boolean;
};

export function QuestionNavigator({
  questions,
  currentIndex,
  windowStart,
  windowEnd,
  answers,
  flagged,
  onGoToIndex,
  footer,
  reviewMode = false,
}: QuestionNavigatorProps) {
  return (
    <Card className="flex min-h-0 flex-col shadow-sm lg:col-span-1">
      <CardHeader>
        <CardTitle>Danh sách câu</CardTitle>
        <CardDescription>Bấm để chuyển câu</CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-auto">
        <div className="space-y-3">
          {reviewMode ? (
            <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Đúng
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Sai
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                Bỏ qua
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                <span className="h-2 w-2 rounded-full bg-gray-500" />
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
          )}

          <div className="rounded-xl border bg-muted/20 p-2">
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6">
              {questions.map((q, idx) => {
                const userAnswers = answers[q.id] ?? [];
                const answered = userAnswers.length > 0;
                const active = idx === currentIndex;
                const inWindow = idx >= windowStart && idx <= windowEnd;
                const isFlagged = Boolean(flagged[q.id]);

                // Review mode: check if answer is correct
                let isCorrectAnswer = false;
                let isWrongAnswer = false;
                if (reviewMode && answered) {
                  const correctKeys = q.options
                    .filter((o) => o.isCorrect === true)
                    .map((o) => o.key);
                  const userSorted = [...userAnswers].sort();
                  const correctSorted = [...correctKeys].sort();
                  isCorrectAnswer =
                    userSorted.length === correctSorted.length &&
                    userSorted.every((k, i) => k === correctSorted[i]);
                  isWrongAnswer = !isCorrectAnswer;
                }

                let buttonClass = "";
                let title = "";

                if (active) {
                  if (reviewMode) {
                    if (isCorrectAnswer) {
                      buttonClass =
                        "border-emerald-500 bg-emerald-500 text-white";
                      title = "Đúng (đang xem)";
                    } else if (isWrongAnswer) {
                      buttonClass = "border-red-500 bg-red-500 text-white";
                      title = "Sai (đang xem)";
                    } else {
                      buttonClass = "border-gray-500 bg-gray-500 text-white";
                      title = "Bỏ qua (đang xem)";
                    }
                  } else {
                    buttonClass = isFlagged
                      ? "border-amber-400 bg-amber-200 text-amber-950"
                      : "border-primary bg-primary text-primary-foreground";
                    title = isFlagged ? "Đã đặt cờ" : "Đang chọn";
                  }
                } else if (reviewMode) {
                  if (isCorrectAnswer) {
                    buttonClass =
                      "border-emerald-400 bg-emerald-100 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100";
                    title = "Đúng";
                  } else if (isWrongAnswer) {
                    buttonClass =
                      "border-red-400 bg-red-100 hover:bg-red-200 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-900 dark:text-red-100";
                    title = "Sai";
                  } else {
                    buttonClass =
                      "border-gray-400 bg-gray-300 hover:bg-gray-400 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 text-gray-800 dark:text-gray-200";
                    title = "Bỏ qua";
                  }
                } else {
                  if (isFlagged) {
                    buttonClass =
                      "border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/20 dark:hover:bg-amber-950/35";
                    title = "Đã đặt cờ";
                  } else if (answered) {
                    buttonClass =
                      "border-gray-400 bg-gray-300 hover:bg-gray-400 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 text-gray-800 dark:text-gray-200";
                    title = "Đã trả lời";
                  } else {
                    buttonClass = "border-input hover:bg-accent";
                    title = "Chưa trả lời";
                  }
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onGoToIndex(idx)}
                    className={cn(
                      "h-10 rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      buttonClass,
                      inWindow && !active && "ring-2 ring-primary/25",
                    )}
                    title={title}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <span>{idx + 1}</span>
                      {isFlagged && !reviewMode ? (
                        <Flag className="size-3" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {footer ? (
        <CardFooter className="flex flex-wrap gap-2">{footer}</CardFooter>
      ) : null}
    </Card>
  );
}
