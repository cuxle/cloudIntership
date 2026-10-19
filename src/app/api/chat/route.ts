import { demoReply, type DemoMessage } from "@/lib/demo-chat";

export const runtime = "nodejs";

type Payload = {
  model?: unknown;
  temperature?: unknown;
  stream?: unknown;
  messages?: unknown;
  apiKey?: unknown;
  api_key?: unknown;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return Response.json({ error: "请求体不是 JSON。" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "请求体必须是对象。" }, { status: 400 });
  }

  if ("apiKey" in body || "api_key" in body) {
    return Response.json(
      { error: "不要把密钥放进浏览器请求。密钥只留在服务端环境变量里。" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "messages 必须是非空数组。" }, { status: 400 });
  }

  const messages: DemoMessage[] = [];
  for (const message of body.messages) {
    if (
      !message ||
      typeof message !== "object" ||
      typeof (message as DemoMessage).role !== "string" ||
      typeof (message as DemoMessage).content !== "string"
    ) {
      return Response.json({ error: "每条消息都要有字符串 role 和 content。" }, { status: 400 });
    }
    messages.push({
      role: (message as DemoMessage).role,
      content: (message as DemoMessage).content,
    });
  }

  const model = body.model === "demo-large" ? "demo-large" : "demo-small";
  const temperature = typeof body.temperature === "number" && Number.isFinite(body.temperature)
    ? Math.min(2, Math.max(0, body.temperature))
    : 0;
  const reply = demoReply(messages, temperature, model);

  if (body.stream === true) {
    const encoder = new TextEncoder();
    const characters = [...reply.content];
    const stream = new ReadableStream({
      async start(controller) {
        for (let index = 0; index < characters.length; index += 2) {
          const content = characters.slice(index, index + 2).join("");
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          await new Promise((resolve) => setTimeout(resolve, 18));
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ note: reply.note, usage: reply.usage })}\n\n`),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Moke-Demo": "1",
      },
    });
  }

  return Response.json(
    {
      id: "chatcmpl_demo",
      object: "chat.completion",
      model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: reply.content },
          finish_reason: "stop",
        },
      ],
      usage: reply.usage,
      moke: { demo: true, note: reply.note },
    },
    { headers: { "X-Moke-Demo": "1" } },
  );
}
