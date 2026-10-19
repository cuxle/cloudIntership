export type SchemaSample = {
  id: string;
  label: string;
  raw: string;
};

export const schemaSamples: SchemaSample[] = [
  {
    id: "ok",
    label: "A",
    raw: '{"status":"found","reply":"订单 10086 已出库，正在派送。"}',
  },
  {
    id: "text",
    label: "B",
    raw: "好的，我帮你查一下订单 10086。",
  },
  {
    id: "fence",
    label: "C",
    raw: '```json\n{"status":"missing","reply":"没有这个订单"}\n```',
  },
  {
    id: "enum",
    label: "D",
    raw: '{"status":"ok","reply":"有货"}',
  },
];

const statuses = new Set(["found", "missing", "need_more"]);

export function validateOrderReply(raw: string): { ok: boolean; reason: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      reason: "不是合法 JSON。前后的说明、Markdown 围栏都会让 JSON.parse 失败。",
    };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, reason: "顶层必须是对象。" };
  }
  const record = data as Record<string, unknown>;
  const keys = Object.keys(record);
  const extra = keys.filter((key) => key !== "status" && key !== "reply");
  if (!keys.includes("status") || !keys.includes("reply") || extra.length > 0) {
    return { ok: false, reason: "只能有 status 和 reply 两个字段。" };
  }
  if (typeof record.status !== "string" || !statuses.has(record.status)) {
    return { ok: false, reason: "status 必须是 found、missing 或 need_more。合法 JSON 不等于符合契约。" };
  }
  if (typeof record.reply !== "string" || record.reply.trim() === "") {
    return { ok: false, reason: "reply 必须是非空字符串。" };
  }
  return { ok: true, reason: "可以通过校验，程序能直接读取 status 和 reply。" };
}
