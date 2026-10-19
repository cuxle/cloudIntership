import type { Check } from "@/lib/messages";

export const promptTask = {
  title: "给客服模型写一段系统说明",
  brief:
    "用户会发来订单号和问题。没有订单号时请他补充；有订单号但查不到时明确说查不到；查到了就按状态说明下一步。不要许诺退款。只输出 JSON，字段只有 status 和 reply。status 取 found、missing 或 need_more。",
};

export const referencePrompt = `你是青石书店的客服。用户会提供订单号和问题。

按这个顺序处理：
1. 没有订单号时，status 用 need_more，请用户补充。
2. 有订单号但查不到时，status 用 missing，明确说查不到，不要猜测物流。
3. 查到时，status 用 found，根据订单状态说明下一步。

禁止许诺退款、赔偿或具体到货日期。
只输出 JSON，不要 Markdown。字段只有 status 和 reply。
reply 用中文，不超过 80 字。

示例：
用户：订单 10086 到哪了？
{"status":"found","reply":"订单 10086 已出库，正在派送。到货日期以物流更新为准。"}`;

export function gradePrompt(text: string): Check[] {
  return [
    {
      id: "role",
      label: "写了角色",
      ok: /你是|作为|担任|客服/.test(text),
      hint: "先说它是谁。角色会约束口吻和职责。",
    },
    {
      id: "input",
      label: "说明了输入是什么",
      ok: /订单/.test(text),
      hint: "写明用户会提供什么，模型才知道缺了哪一项。",
    },
    {
      id: "branch",
      label: "写了查不到或信息不够时怎么办",
      ok: /查不到|找不到|没有订单|缺少|不够|need_more|不确定/.test(text),
      hint: "异常分支要写出来。否则模型会用空话把缺口补上。",
    },
    {
      id: "format",
      label: "规定了 JSON 和字段",
      ok: /json/i.test(text) && /status/.test(text) && /reply/.test(text),
      hint: "写出只输出 JSON，并点名字段 status 和 reply。",
    },
    {
      id: "forbid",
      label: "写了禁止项",
      ok: /不要|禁止|别|勿|不能/.test(text),
      hint: "把不该做的事写成禁止，例如不要许诺退款。",
    },
    {
      id: "example",
      label: "给了一个例子",
      ok: /例如|示例|比如|样例/.test(text),
      hint: "一个短例子比再写三段形容词更有用。注意别让模型照抄例子里的订单号。",
    },
  ];
}
