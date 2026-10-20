"use client";

import Link from "next/link";
import { lessons } from "@/lib/course";
import { useProgress } from "@/lib/progress";

export function SiteHeader() {
  const progress = useProgress();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="font-serif text-xl tracking-wide text-foreground">
          模课
        </Link>
        <p className="text-sm text-muted-foreground tabular-nums">
          {progress.ready
            ? `${progress.passedCount} / ${lessons.length} 节已过关`
            : "正在读取进度"}
        </p>
      </div>
    </header>
  );
}
