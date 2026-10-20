"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { previewChat } from "@/lib/demo-chat";

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
    const result = previewChat(payload);
    setStatus(result.status);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    try {
      if (!stream) {
        setReply(result.content);
        setNote(result.note);
        setUsage(result.usage);
        return;
      }
      const characters = [...result.content];
      for (let index = 0; index < characters.length; index += 2) {
        setReply((current) => current + characters.slice(index, index + 2).join(""));
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      setNote(result.note);
      setUsage(result.usage);
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
          {pending ? "正在接收…" : "发送这次请求"}
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
            还没有请求。发送之后，手机会在本地逐字显示教学回复，不联网，也不会把密钥发出去。
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
