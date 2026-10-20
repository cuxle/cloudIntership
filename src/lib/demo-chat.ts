import { estimateTokens } from "@/lib/tokens";

export type DemoMessage = { role: string; content: string };

export function temperatureNote(temperature: number): string {
  if (temperature <= 0.2) return "温度接近 0：同样的输入会更稳，适合客服、抽取和 JSON。";
  if (temperature >= 1) return "温度偏高：措辞会更散。要稳定格式时不要用这个值。";
  return "温度中等：起草文字可以，格式敏感的任务仍建议调低。";
}

export function modelNote(model: string): string {
  if (model === "demo-large") {
    return "大模型留给拿不准的推理。分类、抽取和路由可以先用小模型。";
  }
  return "小模型适合路由和抽取。答不稳时再升级，而不是所有请求都走最贵的模型。";
}

export function previewChat(input: {
  model?: string;
  temperature?: number;
  messages?: DemoMessage[];
  apiKey?: string;
}):
  | { ok: false; status: number; error: string }
  | { ok: true; status: 200; content: string; note: string; usage: { prompt_tokens: number; completion_tokens: number } } {
  if (input.apiKey) {
    return { ok: false, status: 400, error: "不要把密钥放进浏览器请求。密钥只留在服务端环境变量里。" };
  }
  const messages = input.messages ?? [];
  if (messages.length === 0) {
    return { ok: false, status: 400, error: "messages 必须是非空数组。" };
  }
  for (const message of messages) {
    if (typeof message.role !== "string" || typeof message.content !== "string") {
      return { ok: false, status: 400, error: "每条消息都要有字符串 role 和 content。" };
    }
  }
  const model = input.model === "demo-large" ? "demo-large" : "demo-small";
  const temperature = typeof input.temperature === "number" && Number.isFinite(input.temperature)
    ? Math.min(2, Math.max(0, input.temperature))
    : 0;
  const reply = demoReply(messages, temperature, model);
  return { ok: true, status: 200, content: reply.content, note: reply.note, usage: reply.usage };
}

export function demoReply(messages: DemoMessage[], temperature: number, model: string) {
  const system = messages.find((message) => message.role === "system");
  const user = [...messages].reverse().find((message) => message.role === "user");
  const heard = user?.content.trim() || "（没有用户消息）";
  const policy = system?.content.trim()
    ? "系统消息已经带上，规矩会和这轮对话一起送进模型。"
    : "这次没有系统消息。模型没有缺省规矩，只能凭用户那句话发挥。";
  const content = `收到用户消息：「${heard.slice(0, 80)}」。${policy}这是教学接口，没有转发给真正的模型供应商。`;
  const promptTokens = messages.reduce((sum, message) => sum + estimateTokens(`${message.role} ${message.content}`), 0);
  return {
    content,
    note: `${temperatureNote(temperature)}${modelNote(model)}`,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: estimateTokens(content),
    },
  };
}
