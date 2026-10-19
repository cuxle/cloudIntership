"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/course";
import { useProgress } from "@/lib/progress";

export function Quiz({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const progress = useProgress();
  const [selected, setSelected] = useState<Record<string, number | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const passed = progress.passed(slug);

  function submit() {
    if (questions.some((question) => selected[question.id] === undefined)) {
      setError("还有没选的题。");
      setSubmitted(false);
      return;
    }
    const correct = questions.filter((question) => selected[question.id] === question.answer).length;
    setError("");
    setSubmitted(true);
    if (!passed || correct === questions.length) {
      progress.record(slug, correct, questions.length);
    }
  }

  function retry() {
    setSelected({});
    setSubmitted(false);
    setError("");
  }

  const correctCount = questions.filter((question) => selected[question.id] === question.answer).length;

  return (
    <section className="mt-12">
      <p className="text-xs tracking-[0.18em] text-primary">小测</p>
      <h2 className="mt-2 font-serif text-2xl">三题都对，这节才算过关</h2>
      {passed ? <p className="mt-2 text-sm text-accent-foreground">这节已经过关，可以再做一次。</p> : null}
      <ol className="mt-5 space-y-6">
        {questions.map((question, questionIndex) => (
          <li key={question.id}>
            <fieldset>
              <legend className="text-base leading-7">
                {questionIndex + 1}. {question.prompt}
              </legend>
              <div className="mt-3 space-y-2">
                {question.choices.map((choice, choiceIndex) => {
                  const picked = selected[question.id] === choiceIndex;
                  const show = submitted;
                  const isAnswer = choiceIndex === question.answer;
                  const tone = !show
                    ? picked
                      ? "border-foreground"
                      : "border-border"
                    : isAnswer
                      ? "border-[#2f6f5e] bg-accent"
                      : picked
                        ? "border-destructive"
                        : "border-border";
                  return (
                    <label key={choice} className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-3 text-sm leading-6 ${tone}`}>
                      <input
                        type="radio"
                        name={question.id}
                        className="mt-1 accent-[#8f3b24]"
                        checked={picked}
                        onChange={() => {
                          setSelected((current) => ({ ...current, [question.id]: choiceIndex }));
                          setSubmitted(false);
                          setError("");
                        }}
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </div>
              {submitted ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{question.explain}</p> : null}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" className="h-10 px-4" onClick={submit}>
          提交答案
        </Button>
        {submitted ? (
          <Button type="button" variant="outline" className="h-10 px-4" onClick={retry}>
            再试一次
          </Button>
        ) : null}
        {submitted ? (
          <p className="text-sm tabular-nums">
            {correctCount} / {questions.length}
            {correctCount === questions.length ? " · 已过关" : " · 还没过关"}
          </p>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
