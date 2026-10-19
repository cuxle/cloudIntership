"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { countChars, estimateTokens } from "@/lib/tokens";

const sample = "青石书店周六和周日 10:00–21:00 营业。不知道就说不知道。";

export function TokenLab() {
  const [text, setText] = useState(sample);
  const stats = useMemo(() => {
    const chars = countChars(text);
    return { ...chars, tokens: estimateTokens(text) };
  }, [text]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <label htmlFor="token-text" className="text-sm font-medium">
          随便贴一段你会放进提示词的话
        </label>
        <Textarea
          id="token-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="mt-2 min-h-36 bg-background"
        />
      </div>
      <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        <Stat label="汉字" value={String(stats.cjk)} />
        <Stat label="其他字符" value={String(stats.other)} />
        <Stat label="粗算 token" value={String(stats.tokens)} />
      </dl>
      <p className="text-sm leading-6 text-muted-foreground lg:col-span-2">
        粗算按一个汉字约 1.4 个 token、四个英文字符约 1 个 token。账单以模型分词器为准，窗口也是。
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background px-3 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-serif text-3xl tabular-nums">{value}</dd>
    </div>
  );
}
