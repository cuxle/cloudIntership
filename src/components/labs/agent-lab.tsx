"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { agentPresets, runAgent, toolSchemas, type TraceStep } from "@/lib/agent";

export function AgentLab() {
  const [question, setQuestion] = useState(agentPresets[0]);
  const [steps, setSteps] = useState<TraceStep[] | null>(null);
  const [shown, setShown] = useState(0);
  const [error, setError] = useState("");

  function run(next = question) {
    const value = next.trim();
    if (!value) {
      setError("先写一个问题。");
      setSteps(null);
      setShown(0);
      return;
    }
    setError("");
    setQuestion(next);
    const trace = runAgent(value);
    setSteps(trace);
    setShown(1);
  }

  const visible = steps?.slice(0, shown) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {agentPresets.map((preset) => (
          <Button key={preset} type="button" variant="outline" size="sm" onClick={() => run(preset)}>
            {preset}
          </Button>
        ))}
      </div>
      <label htmlFor="agent-question" className="block text-sm font-medium">
        用户问题
      </label>
      <Textarea
        id="agent-question"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        className="min-h-20 bg-background"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="h-10 px-4" onClick={() => run()}>
          从头走一轮
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          disabled={!steps || shown >= steps.length}
          onClick={() => setShown((value) => value + 1)}
        >
          下一步
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={!steps}
          onClick={() => setShown(steps?.length ?? 0)}
        >
          一次看完
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {visible.length ? (
        <ol className="space-y-3">
          {visible.map((step, index) => (
            <li key={`${step.kind}-${index}`} className="rounded-xl border bg-background px-4 py-3">
              <StepBody step={step} index={index + 1} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">
          还没开始。点一个例子，看模型提议、程序执行、再把结果拼成回答。写诗那一题会停下来。
        </p>
      )}
      {steps && shown >= steps.length ? (
        <p className="text-sm leading-7 text-muted-foreground">
          回答是工具结果的拼接，故意没有润色。真正的模型会写成自然的话，但不该添上工具没返回的事实。
        </p>
      ) : null}
      <details className="rounded-xl border bg-background px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">这两个工具的参数格式</summary>
        <pre className="mt-3 overflow-auto font-mono text-[12px] leading-6">{JSON.stringify(toolSchemas, null, 2)}</pre>
      </details>
    </div>
  );
}

function StepBody({ step, index }: { step: TraceStep; index: number }) {
  if (step.kind === "decide") {
    return (
      <>
        <p className="text-xs tracking-[0.16em] text-primary">第 {index} 步 · 决定</p>
        <p className="mt-2 leading-7">{step.text}</p>
      </>
    );
  }
  if (step.kind === "tool") {
    return (
      <>
        <p className="text-xs tracking-[0.16em] text-primary">第 {index} 步 · 程序执行 {step.name}</p>
        <p className="mt-2 font-mono text-[12px] leading-6">参数 {JSON.stringify(step.args)}</p>
        <p className="mt-2 leading-7">结果：{step.result}</p>
      </>
    );
  }
  return (
    <>
      <p className="text-xs tracking-[0.16em] text-primary">第 {index} 步 · 回答用户</p>
      <p className="mt-2 leading-7">{step.text}</p>
    </>
  );
}
