"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { schemaSamples, validateOrderReply } from "@/lib/schema-check";

type Verdict = "yes" | "no";

export function SchemaLab() {
  const [choices, setChoices] = useState<Record<string, Verdict | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function judge() {
    if (schemaSamples.some((sample) => !choices[sample.id])) {
      setError("四段都要判断。");
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
  }

  const correctCount = schemaSamples.filter((sample) => {
    const actual = validateOrderReply(sample.raw).ok;
    return (choices[sample.id] === "yes") === actual;
  }).length;

  return (
    <div>
      <ol className="space-y-4">
        {schemaSamples.map((sample) => {
          const result = validateOrderReply(sample.raw);
          const picked = choices[sample.id];
          const judged = submitted && picked;
          const right = judged ? (picked === "yes") === result.ok : false;
          return (
            <li key={sample.id} className="rounded-xl border bg-background p-4">
              <p className="text-xs tracking-[0.16em] text-primary">样本 {sample.label}</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap font-mono text-[13px] leading-6">{sample.raw}</pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={picked === "yes" ? "default" : "outline"}
                  onClick={() => {
                    setChoices((current) => ({ ...current, [sample.id]: "yes" }));
                    setSubmitted(false);
                  }}
                >
                  能入库
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={picked === "no" ? "default" : "outline"}
                  onClick={() => {
                    setChoices((current) => ({ ...current, [sample.id]: "no" }));
                    setSubmitted(false);
                  }}
                >
                  不能入库
                </Button>
              </div>
              {judged ? (
                <p className={`mt-3 text-sm leading-6 ${right ? "text-accent-foreground" : "text-destructive"}`}>
                  {right ? "判断对了。" : "判断偏了。"}
                  {result.reason}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" className="h-10 px-4" onClick={judge}>
          核对判断
        </Button>
        {submitted ? (
          <p className="text-sm tabular-nums">
            {correctCount} / {schemaSamples.length} 段判断正确
          </p>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
