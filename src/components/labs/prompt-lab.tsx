"use client";

import { useMemo, useState } from "react";
import { CheckList } from "@/components/check-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { gradePrompt, promptTask, referencePrompt } from "@/lib/prompt-grade";

export function PromptLab() {
  const [draft, setDraft] = useState("");
  const [showReference, setShowReference] = useState(false);
  const checks = useMemo(() => gradePrompt(draft), [draft]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <div className="rounded-xl border bg-background px-4 py-3">
          <p className="text-sm font-medium">{promptTask.title}</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{promptTask.brief}</p>
        </div>
        <label htmlFor="prompt-draft" className="mt-4 block text-sm font-medium">
          你的系统说明
        </label>
        <Textarea
          id="prompt-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="你是……用户会……查不到时……只输出 JSON……"
          className="mt-2 min-h-52 bg-background"
        />
        <div className="mt-3">
          <Button type="button" variant="outline" onClick={() => setShowReference((value) => !value)}>
            {showReference ? "收起参考写法" : "对一下参考写法"}
          </Button>
        </div>
        {showReference ? (
          <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl bg-[#231e18] p-4 font-mono text-[12px] leading-6 text-[#f6f1e7]">
            {referencePrompt}
          </pre>
        ) : null}
      </div>
      <div className="rounded-xl border bg-background p-4">
        {draft.trim() ? (
          <CheckList checks={checks} />
        ) : (
          <p className="text-sm leading-7 text-muted-foreground">
            先写几句。清单会按角色、输入、异常分支、格式、禁止项和例子逐项看，不会替你调用模型。
          </p>
        )}
      </div>
    </div>
  );
}
