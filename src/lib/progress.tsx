"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const storageKey = "moke-progress-v1";

type QuizRecord = {
  correct: number;
  total: number;
  passed: boolean;
};

type State = {
  quizzes: Record<string, QuizRecord>;
};

type ProgressApi = {
  ready: boolean;
  passed: (slug: string) => boolean;
  passedCount: number;
  quizOf: (slug: string) => QuizRecord | undefined;
  record: (slug: string, correct: number, total: number) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ quizzes: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed && typeof parsed === "object" && parsed.quizzes) {
          setState({ quizzes: parsed.quizzes });
        }
      }
    } catch {
      setState({ quizzes: {} });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [ready, state]);

  const api = useMemo<ProgressApi>(() => {
    const passedCount = Object.values(state.quizzes).filter((quiz) => quiz.passed).length;
    return {
      ready,
      passedCount,
      passed: (slug) => Boolean(state.quizzes[slug]?.passed),
      quizOf: (slug) => state.quizzes[slug],
      record: (slug, correct, total) => {
        setState((current) => ({
          quizzes: {
            ...current.quizzes,
            [slug]: { correct, total, passed: correct === total && total > 0 },
          },
        }));
      },
      reset: () => setState({ quizzes: {} }),
    };
  }, [ready, state.quizzes]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used within ProgressProvider");
  return value;
}
