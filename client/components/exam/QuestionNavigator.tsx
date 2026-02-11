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
}: QuestionNavigatorProps) {
  return (
    <Card className="flex min-h-0 flex-col shadow-sm lg:col-span-1">
      <CardHeader>
        <CardTitle>Danh sách câu</CardTitle>
        <CardDescription>
          Bấm để chuyển câu
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
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6">
              {questions.map((q, idx) => {
                const answered = (answers[q.id]?.length ?? 0) > 0;
                const active = idx === currentIndex;
                const inWindow = idx >= windowStart && idx <= windowEnd;
                const isFlagged = Boolean(flagged[q.id]);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onGoToIndex(idx)}
                    className={cn(
                      "h-10 rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? isFlagged
                          ? "border-amber-400 bg-amber-200 text-amber-950"
                          : "border-primary bg-primary text-primary-foreground"
                        : isFlagged
                          ? "border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/20 dark:hover:bg-amber-950/35"
                          : answered
                            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35"
                            : "border-input hover:bg-accent",
                      inWindow && !active && "ring-2 ring-primary/25",
                    )}
                    title={
                      isFlagged
                        ? "Đã đặt cờ"
                        : answered
                          ? "Đã trả lời"
                          : "Chưa trả lời"
                    }
                  >
                    <span className="flex items-center justify-center gap-1">
                      <span>{idx + 1}</span>
                      {isFlagged ? <Flag className="size-3" /> : null}
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
