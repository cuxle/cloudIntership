"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { lessons } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function CourseHome() {
  const progress = useProgress();
  const [armReset, setArmReset] = useState(false);
  const nextLesson = lessons.find((lesson) => !progress.passed(lesson.slug)) ?? lessons[0];
  const allDone = progress.ready && progress.passedCount === lessons.length;
  const percent = progress.ready ? Math.round((progress.passedCount / lessons.length) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <p className="text-sm tracking-[0.22em] text-primary">大模型应用开发</p>
      <h1 className="mt-3 font-serif text-6xl leading-none text-foreground sm:text-7xl">模课</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
        八节课，从一次调用走到能上线的形状：消息、提示词、接口、结构化输出、检索和工具。装在手机上也能离线学，实验不联网，不需要 API 密钥。
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={`/learn/${nextLesson.slug}`} className={cn(buttonVariants(), "h-10 px-4")}>
          {allDone ? "再看第一节" : progress.passedCount > 0 ? `继续第 ${nextLesson.index} 节` : "从第一节开始"}
        </Link>
        <a href="#path" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
          看八节目录
        </a>
      </div>
      <div className="mt-8 max-w-xl">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>小测全对才算过关</span>
          <span className="tabular-nums">{progress.ready ? `${progress.passedCount} / ${lessons.length}` : "—"}</span>
        </div>
        <Progress value={percent} aria-label="课程进度" />
      </div>
      {allDone ? (
        <aside className="mt-8 max-w-2xl border-l-2 border-[#2f6f5e] bg-accent px-4 py-3">
          <p className="font-medium">八节都过关了。</p>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            下一步挑一个你真的会用的小问题，按同样的顺序做一遍：服务端调用、低温度、JSON 校验，需要时再检索，需要时再加只读工具。先让十条评测稳定通过。
          </p>
        </aside>
      ) : null}
      <ol id="path" className="mt-14 divide-y border-y">
        {lessons.map((lesson) => {
          const done = progress.passed(lesson.slug);
          return (
            <li key={lesson.slug}>
              <Link href={`/learn/${lesson.slug}`} className="group grid gap-2 py-6 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6">
                <span className="font-serif text-3xl text-primary tabular-nums">{lesson.index}</span>
                <span>
                  <span className="block font-serif text-2xl text-foreground group-hover:text-primary">{lesson.title}</span>
                  <span className="mt-2 block max-w-2xl text-sm leading-7 text-muted-foreground">{lesson.summary}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {lesson.minutes} 分钟 · {done ? "已过关" : "含一个实验和三道小题"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <section className="mt-12 grid gap-6 border-t pt-8 sm:grid-cols-3">
        <Note title="先看结构" text="每一节先讲应用要负责的那一层，再给你一段能对照的代码。" />
        <Note title="再动手" text="估 token、改消息、打分提示词、发请求、校验 JSON、检索、走工具循环、算账单。" />
        <Note title="回答从哪来" text="实验里的回复来自规则和这份书店资料，用来看清调用形状，不是外部大模型。" />
      </section>
      {progress.ready && progress.passedCount > 0 ? (
        <div className="mt-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (!armReset) {
                setArmReset(true);
                return;
              }
              progress.reset();
              setArmReset(false);
            }}
          >
            {armReset ? "再点一次，清除这台浏览器上的进度" : "清除学习进度"}
          </Button>
        </div>
      ) : null}
    </main>
  );
}

function Note({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-serif text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
    </div>
  );
}
