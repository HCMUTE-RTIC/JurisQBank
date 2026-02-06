"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CountdownTimer,
  type CountdownTimerProps,
} from "@/components/exam/countdown-timer";

import type { Contest } from "./types";

export type ExamHeaderProps = {
  contest: Contest;
  dataMode: "api" | "mock";
  answeredCount: number;
  total: number;
  flaggedCount: number;
  endsAt: number;
  durationSeconds: number;
  onTimeout: () => void;
  onSubmitClick: () => void;
  submitting: boolean;
  submitted: boolean;
  /** Review mode: hide timer, show "Xong" button instead of submit */
  reviewMode?: boolean;
  onDoneClick?: () => void;
};

export function ExamHeader({
  contest,
  dataMode,
  answeredCount,
  total,
  flaggedCount,
  endsAt,
  durationSeconds,
  onTimeout,
  onSubmitClick,
  submitting,
  submitted,
  reviewMode = false,
  onDoneClick,
}: ExamHeaderProps) {
  const progressPercent =
    total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <Card className="relative overflow-hidden shadow-lg shadow-indigo-500/10 border-indigo-200/60 bg-gradient-to-b from-indigo-50/90 via-card/95 to-card/90 ring-1 ring-indigo-500/15 backdrop-blur-xl dark:border-indigo-900/50 dark:from-indigo-950/40 dark:ring-indigo-400/15 dark:shadow-indigo-500/5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500/50 via-sky-400/40 to-emerald-400/40" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                dataMode === "mock"
                  ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
              )}
            >
              {dataMode === "mock" ? "Mock" : "API"}
            </span>
          </div>

          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight">
            {contest.title}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tiến độ:</span>
            <span className="font-semibold">
              {answeredCount}/{total}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Đặt cờ: {flaggedCount}
            </span>
          </div>

          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/85 via-primary to-emerald-500/75 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {progressPercent}% hoàn thành
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          {reviewMode ? (
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-foreground">
                Chế độ xem đáp án
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Xem lại câu trả lời của bạn
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-foreground">
                Thời gian còn lại
              </div>
              <CountdownTimer
                endsAt={endsAt}
                onExpire={onTimeout}
                warnAtSeconds={60}
                dangerAtSeconds={10}
                durationSeconds={durationSeconds}
                boxed
                className={"text-xl" satisfies CountdownTimerProps["className"]}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {reviewMode ? (
            <Button
              variant="default"
              onClick={onDoneClick}
              className="shadow-sm"
            >
              Xong
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={onSubmitClick}
              disabled={submitting || submitted}
              className="shadow-sm"
            >
              {submitted ? "Đã nộp" : submitting ? "Đang nộp..." : "Nộp bài"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
