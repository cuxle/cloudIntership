"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MIN_SCORE,
  buildPrompt,
  citeAnswer,
  ragPresets,
  retrieve,
  usableHits,
} from "@/lib/bookstore";

export function RagLab() {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");

  const result = asked.trim() ? retrieve(asked) : null;
  const used = result ? usableHits(result.hits) : [];

  function ask(next: string) {
    const value = next.trim();
    setQuery(next);
    setAsked(value);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ragPresets.map((preset) => (
          <Button key={preset} type="button" variant="outline" size="sm" onClick={() => ask(preset)}>
            {preset}
          </Button>
        ))}
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          ask(query);
        }}
      >
        <label className="sr-only" htmlFor="rag-query">
          向青石书店提问
        </label>
        <Input
          id="rag-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例如：周末几点关门？"
          className="h-10 bg-background"
        />
        <Button type="submit" className="h-10 px-4">
          检索
        </Button>
      </form>
      {!result ? (
        <p className="text-sm leading-7 text-muted-foreground">
          还没有问题。点一个例子，或自己问。咖啡、停车以外的闲聊，资料里通常没有。
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">排序</p>
            {result.rewrite.notes.length ? (
              <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
                {result.rewrite.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">这次没有做查询改写。</p>
            )}
            <ul className="space-y-2">
              {result.hits.map((hit) => {
                const kept = hit.score >= MIN_SCORE;
                return (
                  <li key={hit.id} className="rounded-xl border bg-background px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{hit.title}</span>
                      <span className="tabular-nums text-muted-foreground">{hit.score.toFixed(2)}</span>
                    </div>
                    <p className="mt-1 leading-6 text-muted-foreground">
                      {kept ? "放进提示词" : `低于 ${MIN_SCORE.toFixed(2)}，不放进去`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">拼好的提示词</p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#231e18] p-4 font-mono text-[12px] leading-6 text-[#f6f1e7]">
                {buildPrompt(asked, used)}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium">只许引用这些资料时的回答</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{citeAnswer(used)}</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                这里没有调用模型，而是把命中的原句交出来。接上模型之后，仍然要求它只使用这些句子。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
