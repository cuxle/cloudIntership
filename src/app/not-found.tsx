import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <p className="text-sm tracking-[0.18em] text-primary">404</p>
      <h1 className="mt-3 font-serif text-4xl">没有这一节</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">目录里是八节课，地址可能写错了。</p>
      <Link href="/" className={cn(buttonVariants(), "mt-6 h-10 px-4")}>
        回到目录
      </Link>
    </main>
  );
}
