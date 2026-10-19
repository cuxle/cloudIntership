"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
import { Diagram } from "@/components/diagrams";
import { LabFrame } from "@/components/lab-frame";
import { AgentLab } from "@/components/labs/agent-lab";
import { ApiLab } from "@/components/labs/api-lab";
import { CostLab } from "@/components/labs/cost-lab";
import { MessageLab } from "@/components/labs/message-lab";
import { PromptLab } from "@/components/labs/prompt-lab";
import { RagLab } from "@/components/labs/rag-lab";
import { SchemaLab } from "@/components/labs/schema-lab";
import { TokenLab } from "@/components/labs/token-lab";
import { Quiz } from "@/components/quiz";
import { buttonVariants } from "@/components/ui/button";
import { getLesson, lessonNeighbors, lessons, type LabId } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const labs: Record<LabId, () => ReactNode> = {
  tokens: TokenLab,
  messages: MessageLab,
  prompt: PromptLab,
  api: ApiLab,
  schema: SchemaLab,
  rag: RagLab,
  agent: AgentLab,
  cost: CostLab,
};

export function LessonView({ slug }: { slug: string }) {
  const progress = useProgress();
  const lesson = getLesson(slug);
  if (!lesson) return null;
  const { prev, next } = lessonNeighbors(slug);
  const Lab = labs[lesson.lab];

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-5 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-12">
      <nav className="lg:sticky lg:top-20 lg:self-start" aria-label="课程目录">
        <details className="rounded-xl border bg-card lg:hidden">
          <summary className="cursor-pointer px-4 py-3 text-sm">
            目录 · {lesson.index} {lesson.title}
          </summary>
          <LessonLinks current={slug} passed={progress.passed} />
        </details>
        <div className="hidden lg:block">
          <p className="px-2 text-xs tracking-[0.16em] text-muted-foreground">八节</p>
          <LessonLinks current={slug} passed={progress.passed} />
        </div>
      </nav>
      <article className="min-w-0 max-w-3xl">
        <p className="text-sm tabular-nums text-primary">
          {lesson.index} · {lesson.minutes} 分钟
          {progress.passed(slug) ? " · 已过关" : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-foreground sm:text-5xl">{lesson.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{lesson.summary}</p>
        <ul className="mt-5 space-y-1 text-sm leading-6">
          {lesson.objectives.map((objective) => (
            <li key={objective}>· {objective}</li>
          ))}
        </ul>
        {lesson.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-serif text-2xl">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[15px] leading-8">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 space-y-2 text-[15px] leading-7">
                {section.bullets.map((item) => (
                  <li key={item} className="border-l-2 border-primary/40 pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {section.diagram ? <Diagram name={section.diagram} /> : null}
            {section.code ? <CodeBlock filename={section.code.filename} source={section.code.source} /> : null}
            {section.callout ? (
              <aside
                className={`mt-4 border-l-2 px-4 py-3 ${
                  section.callout.tone === "warn" ? "border-destructive bg-destructive/10" : "border-[#2f6f5e] bg-accent"
                }`}
              >
                <p className="text-sm font-medium">{section.callout.title}</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">{section.callout.text}</p>
              </aside>
            ) : null}
          </section>
        ))}
        <LabFrame title={lesson.labTitle} lead={lesson.labLead}>
          <Lab />
        </LabFrame>
        <Quiz slug={lesson.slug} questions={lesson.quiz} />
        <div className="mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <Link href={`/learn/${prev.slug}`} className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
              上一节
            </Link>
          ) : (
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
              回到目录
            </Link>
          )}
          {next ? (
            <Link href={`/learn/${next.slug}`} className={cn(buttonVariants(), "h-10 px-4")}>
              下一节
            </Link>
          ) : (
            <Link href="/" className={cn(buttonVariants(), "h-10 px-4")}>
              回到目录
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}

function LessonLinks({ current, passed }: { current: string; passed: (slug: string) => boolean }) {
  return (
    <ol className="mt-2 space-y-1 px-2 pb-3 lg:px-0">
      {lessons.map((lesson) => {
        const active = lesson.slug === current;
        return (
          <li key={lesson.slug}>
            <Link
              href={`/learn/${lesson.slug}`}
              className={`block rounded-lg px-2 py-2 text-sm leading-5 ${
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="mr-2 tabular-nums">{lesson.index}</span>
              {lesson.title}
              {passed(lesson.slug) ? <span className="ml-2 text-xs text-accent-foreground">过关</span> : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
