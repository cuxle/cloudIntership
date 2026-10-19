import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { getLesson, lessons } from "@/lib/course";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "找不到这一节 · 模课" };
  return {
    title: `${lesson.index} ${lesson.title} · 模课`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getLesson(slug)) notFound();
  return <LessonView slug={slug} />;
}
