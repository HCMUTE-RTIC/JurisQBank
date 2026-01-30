"use client";

import { useEffect, useMemo, useState } from "react";

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readLocalStorageJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  return safeJsonParse<T>(raw);
}

export function writeLocalStorageJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function useLocalStorageJsonState<T>(params: {
  key: string;
  initial: () => T;
}): { state: T; setState: (next: T) => void } {
  const { key, initial } = params;

  const initialValue = useMemo(() => initial(), [initial]);
  const [state, setState] = useState<T>(() => {
    const stored = readLocalStorageJson<T>(key);
    return stored ?? initialValue;
  });

  useEffect(() => {
    writeLocalStorageJson(key, state);
  }, [key, state]);

  return { state, setState };
}
