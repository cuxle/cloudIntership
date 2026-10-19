"use client";

import { useState } from "react";
import { CheckList } from "@/components/check-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  clearMessages,
  reviewMessages,
  vagueMessages,
  type ChatMessage,
  type ChatRole,
} from "@/lib/messages";

export function MessageLab() {
  const [messages, setMessages] = useState<ChatMessage[]>(clearMessages);
  const checks = reviewMessages(messages);
  const payload = JSON.stringify({ model: "demo-small", temperature: 0, messages }, null, 2);

  function update(index: number, patch: Partial<ChatMessage>) {
    setMessages((current) => current.map((message, item) => (item === index ? { ...message, ...patch } : message)));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setMessages(clearMessages)}>
            填入清楚的版本
          </Button>
          <Button type="button" variant="outline" onClick={() => setMessages(vagueMessages)}>
            填入含糊的版本
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setMessages((current) => [...current, { role: "user", content: "" }])}
          >
            加一条消息
          </Button>
        </div>
        <ol className="mt-4 space-y-3">
          {messages.map((message, index) => (
            <li key={`${message.role}-${index}`} className="rounded-xl border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs text-muted-foreground" htmlFor={`role-${index}`}>
                  角色
                </label>
                {messages.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    onClick={() => setMessages((current) => current.filter((_, item) => item !== index))}
                  >
                    删除
                  </button>
                ) : null}
              </div>
              <select
                id={`role-${index}`}
                value={message.role}
                onChange={(event) => update(index, { role: event.target.value as ChatRole })}
                className="mt-1 h-8 w-full rounded-lg border bg-card px-2 text-sm"
              >
                <option value="system">system · 规矩</option>
                <option value="user">user · 用户</option>
                <option value="assistant">assistant · 上一轮回复</option>
              </select>
              <label className="mt-3 block text-xs text-muted-foreground" htmlFor={`content-${index}`}>
                内容
              </label>
              <Textarea
                id={`content-${index}`}
                value={message.content}
                onChange={(event) => update(index, { content: event.target.value })}
                className="mt-1 min-h-20 bg-card"
              />
            </li>
          ))}
        </ol>
      </div>
      <div className="space-y-4">
        <CheckList checks={checks} />
        <div>
          <p className="text-sm font-medium">即将发送的 JSON</p>
          <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-[#231e18] p-4 font-mono text-[12px] leading-6 text-[#f6f1e7]">
            {payload}
          </pre>
        </div>
      </div>
    </div>
  );
}
