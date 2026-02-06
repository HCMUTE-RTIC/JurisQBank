"use client";

import React from "react";
import { Check, Flag, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import type { ExamQuestion } from "./types";

function getDifficultyMeta(
  difficulty?: string,
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

export type ExamQuestionCardProps = {
  question: ExamQuestion;
  index: number; // 0-based global index
  selected: string[];
  flagged: boolean;
  flash: boolean;
  onSelectOption: (question: ExamQuestion, optionKey: string) => void;
  onToggleFlag: (questionId: string) => void;
  /** Review mode: read-only, show correct/wrong colors */
  reviewMode?: boolean;
  /** Called when user interacts with this card (click, focus) */
  onActivate?: (index: number) => void;
  /** Whether this card is currently active/selected */
  isActive?: boolean;
};

export function ExamQuestionCard({
  question,
  index,
  selected,
  flagged,
  flash,
  onSelectOption,
  onToggleFlag,
  reviewMode = false,
  onActivate,
  isActive = false,
}: ExamQuestionCardProps) {
  const meta = getDifficultyMeta(question.difficulty);

  return (
    <div
      id={`exam-question-${question.id}`}
      className={cn(
        "relative scroll-mt-4 rounded-2xl border-2 bg-gradient-to-br from-card via-card to-muted/30 p-5 shadow-md transition-all duration-300",
        isActive
          ? "border-primary/70 shadow-lg shadow-primary/10 ring-2 ring-primary/25 scale-[1.01]"
          : "border-border/80 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        flash && "will-change-[border-color,box-shadow]",
      )}
      style={
        flash
          ? {
              animation: "exam-question-border-flash 2s ease-in-out 1",
            }
          : undefined
      }
      onMouseDown={() => onActivate?.(index)}
    >
      {/* Decorative gradient line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary/50 via-violet-400/40 to-emerald-400/40" />

      {/* Subtle corner glow for active card */}
      {isActive && (
        <>
          <div className="pointer-events-none absolute -left-2 -top-2 h-16 w-16 rounded-full bg-primary/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-emerald-400/15 blur-xl" />
        </>
      )}

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary/15 to-violet-500/10 px-3 py-1.5 text-base font-bold text-primary dark:from-primary/25 dark:to-violet-500/15">
            <span className="text-lg">Câu {index + 1}</span>
          </div>
          {meta ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                meta.className,
              )}
            >
              {meta.label}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {question.topic ? (
            <div
              className="max-w-[22rem] truncate text-sm text-muted-foreground"
              title={question.topic}
            >
              Chủ đề: {question.topic}
            </div>
          ) : null}

          {!reviewMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleFlag(question.id)}
              className={cn(
                "transition-colors",
                flagged
                  ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                  : "hover:bg-muted",
              )}
            >
              <Flag className={cn("size-4", flagged && "fill-current")} />
              {flagged ? "Bỏ cờ" : "Đặt cờ"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 whitespace-pre-wrap break-words text-lg leading-relaxed font-bold [overflow-wrap:anywhere]">
        {question.content}
      </div>

      <div className="mt-4 space-y-2 ">
        {question.options.map((opt) => {
          const checked = selected.includes(opt.key);
          const isCorrect = opt.isCorrect === true;
          const indicatorClass = question.multiSelect
            ? "rounded-sm"
            : "rounded-full";

          // Review mode styling
          let optionClassName = "";
          let indicatorClassName = "";
          let indicatorIcon: React.ReactNode = null;

          if (reviewMode) {
            if (isCorrect) {
              // Correct answer - always show green
              optionClassName =
                "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
              indicatorClassName =
                "border-emerald-500 bg-emerald-500 text-white";
              indicatorIcon = <Check className="h-4 w-4" />;
            } else if (checked && !isCorrect) {
              // Wrong answer - user selected but incorrect
              optionClassName = "border-red-500 bg-red-50 dark:bg-red-950/30";
              indicatorClassName = "border-red-500 bg-red-500 text-white";
              indicatorIcon = <X className="h-4 w-4" />;
            } else {
              // Not selected and not correct - neutral
              optionClassName =
                "border-input bg-gradient-to-b from-background/70 to-muted/20";
              indicatorClassName = "border-input bg-background";
            }
          } else {
            // Normal exam mode
            optionClassName = checked
              ? "border-primary/60 bg-gradient-to-r from-primary/15 via-primary/10 to-emerald-500/10 shadow-sm"
              : "border-input bg-gradient-to-b from-background/70 to-muted/20 hover:bg-accent/60";
            indicatorClassName = checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background";
            indicatorIcon = checked ? <Check className="h-4 w-4" /> : null;
          }

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => !reviewMode && onSelectOption(question, opt.key)}
              aria-pressed={checked}
              disabled={reviewMode}
              className={cn(
                "group w-full rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                optionClassName,
                reviewMode && "cursor-default",
                !reviewMode && !checked && "hover:scale-[1.01] hover:shadow-md",
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                    indicatorClass,
                    indicatorClassName,
                  )}
                >
                  {indicatorIcon}
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
}
