function Caption({ children }: { children: string }) {
  return <figcaption className="mt-2 text-xs text-muted-foreground">{children}</figcaption>;
}

function Step({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs tracking-[0.16em] text-primary">{index}</p>
      <p className="mt-1 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export function Diagram({ name }: { name: "roles" | "window" | "rag" | "agent" }) {
  if (name === "roles") {
    return (
      <figure className="my-4 grid gap-2">
        <Step index="01" title="你的程序" text="决定这次放进窗口的规矩、历史、资料和工具结果。" />
        <Step index="02" title="模型" text="只根据这些上下文，预测下一段 token。" />
        <Step index="03" title="你的程序" text="校验输出，执行工具，展示给用户，或再请求一次。" />
        <Caption>模型不拥有你的数据库，也不替你保管记忆。</Caption>
      </figure>
    );
  }

  if (name === "window") {
    return (
      <figure className="my-4">
        <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
          <div className="w-[18%] bg-[#5c4a3a]" />
          <div className="w-[22%] bg-[#8f5a3c]" />
          <div className="w-[40%] bg-[#8f3b24]" />
          <div className="w-[20%] bg-[#2f6f5e]" />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <li><span className="mr-2 inline-block size-2 bg-[#5c4a3a]" />系统说明</li>
          <li><span className="mr-2 inline-block size-2 bg-[#8f5a3c]" />历史</li>
          <li><span className="mr-2 inline-block size-2 bg-[#8f3b24]" />检索资料</li>
          <li><span className="mr-2 inline-block size-2 bg-[#2f6f5e]" />留给输出</li>
        </ul>
        <Caption>同一扇窗口。资料和历史变长，能生成的回答就变短。</Caption>
      </figure>
    );
  }

  if (name === "rag") {
    return (
      <figure className="my-4 grid gap-2">
        <Step index="01" title="切块" text="把文档切成带重叠的段落，太整篇塞不进检索，太碎又失去上下文。" />
        <Step index="02" title="检索" text="用问题找出少数相关片段。没命中就是空结果，不是失败的异常。" />
        <Step index="03" title="拼进提示词" text="只把命中的片段交给模型，并要求它引用编号，没有依据就说不知道。" />
        <Caption>检索改的是这次请求的输入，不是模型的权重。</Caption>
      </figure>
    );
  }

  return (
    <figure className="my-4 grid gap-2">
      <Step index="01" title="模型提议" text="根据工具说明返回工具名和参数，此时还没有最终答案。" />
      <Step index="02" title="程序执行" text="校验参数，查数据库或计算。写操作先停下来等人确认。" />
      <Step index="03" title="结果送回" text="把工具结果放进下一次请求。模型再决定继续调用，或回答用户。" />
      <Caption>步数要有上限。停不住的循环比答得慢更糟。</Caption>
    </figure>
  );
}
