"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function toEpochMs(value: Date | string | number): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return parsed;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad2 = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export type CountdownTimerState = {
  endsAtMs: number;
  nowMs: number;
  remainingMs: number;
  remainingSeconds: number;
  isExpired: boolean;
};

export type CountdownTimerProps = {
  endsAt: Date | string | number;
  onExpire: () => void | Promise<void>;

  tickMs?: number;
  className?: string;

  boxed?: boolean;

  /** Total exam duration (in seconds). Used for progress-based boxed thresholds (e.g. half time). */
  durationSeconds?: number;

  warnAtSeconds?: number;
  dangerAtSeconds?: number;

  onTick?: (state: CountdownTimerState) => void;
  render?: (state: CountdownTimerState) => React.ReactNode;
};

export function CountdownTimer({
  endsAt,
  onExpire,
  tickMs = 250,
  className,
  boxed = false,
  durationSeconds,
  warnAtSeconds = 60,
  dangerAtSeconds = 10,
  onTick,
  render,
}: CountdownTimerProps) {
  const endsAtMs = useMemo(() => toEpochMs(endsAt), [endsAt]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const didExpireRef = useRef(false);

  const remainingMs = Math.max(0, endsAtMs - nowMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const isExpired = remainingMs <= 0;

  const state: CountdownTimerState = {
    endsAtMs,
    nowMs,
    remainingMs,
    remainingSeconds,
    isExpired,
  };

  useEffect(() => {
    didExpireRef.current = false;
  }, [endsAtMs]);

  useEffect(() => {
    if (!Number.isFinite(endsAtMs)) return;

    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, tickMs);

    return () => {
      window.clearInterval(id);
    };
  }, [endsAtMs, tickMs]);

  useEffect(() => {
    onTick?.(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.remainingSeconds]);

  useEffect(() => {
    if (!isExpired) return;
    if (didExpireRef.current) return;

    didExpireRef.current = true;
    void onExpire();
  }, [isExpired, onExpire]);

  const boxedTone: "green" | "yellow" | "orange" | "red" = boxed
    ? remainingSeconds <= 5 * 60
      ? "red"
      : remainingSeconds <= 15 * 60
      ? "orange"
      : typeof durationSeconds === "number" && durationSeconds > 0
      ? remainingSeconds <= durationSeconds / 2
        ? "yellow"
        : "green"
      : "green"
    : "green";

  const boxToneClass =
    boxedTone === "red"
      ? "border-red-200 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      : boxedTone === "orange"
      ? "border-orange-200 bg-orange-100 text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
      : boxedTone === "yellow"
      ? "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      : "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";

  const textToneClass = boxed
    ? ""
    : remainingSeconds <= dangerAtSeconds
    ? "text-destructive"
    : remainingSeconds <= warnAtSeconds
    ? "text-amber-700 dark:text-amber-300"
    : "text-foreground";

  if (render) {
    return <>{render(state)}</>;
  }

  return (
    <span
      className={cn(
        "font-mono",
        boxed &&
          "inline-flex items-center justify-center rounded-md border px-3 py-1 tabular-nums",
        boxed ? boxToneClass : textToneClass,
        className
      )}
    >
      {formatMs(remainingMs)}
    </span>
  );
}

export function computeEndsAtMs(params: {
  startedAt: Date | string | number;
  durationSeconds: number;
}): number {
  const startedAtMs = toEpochMs(params.startedAt);
  return startedAtMs + params.durationSeconds * 1000;
}
