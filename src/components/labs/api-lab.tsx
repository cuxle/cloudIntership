"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Usage = { prompt_tokens: number; completion_tokens: number };

export function ApiLab() {
  const [model, setModel] = useState("demo-small");
  const [temperature, setTemperature] = useState(0);
  const [stream, setStream] = useState(true);
  const [system, setSystem] = useState("你是青石书店的店员。不知道就说不知道。");
  const [userText, setUserText] = useState("周末开门吗？");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const payload = {
    model,
    temperature,
    stream,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userText },
    ],
  };

  async function send() {
    setPending(true);
    setError("");
    setReply("");
    setNote("");
    setUsage(null);
    setStatus(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(response.status);
      if (!response.ok) {
        const failure = (await response.json()) as { error?: string };
        setError(failure.error ?? "请求失败。");
        return;
      }
      if (!stream) {
        const data = (await response.json()) as {
          choices: { message: { content: string } }[];
          usage: Usage;
          moke: { note: string };
        };
        setReply(data.choices[0]?.message.content ?? "");
        setNote(data.moke.note);
        setUsage(data.usage);
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) {
        setError("浏览器没有拿到流式响应。");
        return;
      }
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const data = event.replace(/^data:\s*/, "").trim();
          if (!data || data === "[DONE]") continue;
          const chunk = JSON.parse(data) as { content?: string; note?: string; usage?: Usage };
          if (chunk.content) setReply((current) => current + chunk.content);
          if (chunk.note) setNote(chunk.note);
          if (chunk.usage) setUsage(chunk.usage);
        }
      }
    } catch {
      setError("网络中断了，没有收到完整响应。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">模型</span>
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="mt-1 h-9 w-full rounded-lg border bg-background px-2 text-sm"
            >
              <option value="demo-small">demo-small · 路由和抽取</option>
              <option value="demo-large">demo-large · 复杂推理</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">温度 {temperature.toFixed(1)}</span>
            <Input
              type="range"
              min={0}
              max={1.4}
              step={0.1}
              value={temperature}
              onChange={(event) => setTemperature(Number(event.target.value))}
              className="mt-2 px-0"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={stream}
            onChange={(event) => setStream(event.target.checked)}
            className="size-4 accent-[#8f3b24]"
          />
          流式输出，先看到第一个字
        </label>
        <label className="block text-sm">
          <span className="font-medium">system</span>
          <Textarea value={system} onChange={(event) => setSystem(event.target.value)} className="mt-1 min-h-20 bg-background" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">user</span>
          <Textarea value={userText} onChange={(event) => setUserText(event.target.value)} className="mt-1 min-h-20 bg-background" />
        </label>
        <Button type="button" onClick={send} disabled={pending} className="h-10 px-4">
          {pending ? "正在接收…" : "发送到 /api/chat"}
        </Button>
        <pre className="overflow-auto rounded-xl bg-[#231e18] p-4 font-mono text-[12px] leading-6 text-[#f6f1e7]">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
      <div className="rounded-xl border bg-background p-4">
        <p className="text-sm font-medium">响应</p>
        {status ? <p className="mt-1 text-xs text-muted-foreground">HTTP {status}</p> : null}
        {error ? <p className="mt-3 text-sm leading-6 text-destructive">{error}</p> : null}
        {!error && !reply && !pending ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            还没有请求。发送之后，这里会逐字出现教学接口的回复。它不会转发给外部模型。
          </p>
        ) : null}
        {reply ? <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{reply}</p> : null}
        {note ? <p className="mt-4 border-t pt-3 text-sm leading-7 text-muted-foreground">{note}</p> : null}
        {usage ? (
          <p className="mt-3 text-xs tabular-nums text-muted-foreground">
            粗算输入 {usage.prompt_tokens} token · 输出 {usage.completion_tokens} token
          </p>
        ) : null}
      </div>
    </div>
  );
}
