"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CodeBlock({ filename, source }: { filename: string; source: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  }

  return (
    <figure className="my-4 overflow-hidden rounded-xl bg-[#231e18] text-[#f6f1e7]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 text-xs text-[#d9cbb8]">
        <span className="truncate font-mono">{filename}</span>
        <Button
          type="button"
          size="xs"
          variant="secondary"
          className="bg-[#3a332b] text-[#f6f1e7] hover:bg-[#4a4036]"
          onClick={copy}
        >
          {copied ? "已复制" : failed ? "复制失败" : "复制"}
        </Button>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
        <code>{source}</code>
      </pre>
    </figure>
  );
}
