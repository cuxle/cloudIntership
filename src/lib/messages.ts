export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type Check = {
  id: string;
  label: string;
  ok: boolean;
  hint: string;
};

export const vagueMessages: ChatMessage[] = [
  { role: "system", content: "你很聪明，帮帮我。" },
  { role: "user", content: "周末开门吗？" },
];

export const clearMessages: ChatMessage[] = [
  {
    role: "system",
    content:
      "你是青石书店的店员。只根据本轮对话回答。不知道就说不知道，不要编营业时间。回答不超过 40 个字。",
  },
  { role: "user", content: "你们周末开门吗？" },
];

export function reviewMessages(messages: ChatMessage[]): Check[] {
  const system = messages.find((message) => message.role === "system");
  const systemText = system?.content ?? "";
  return [
    {
      id: "system",
      label: "有系统消息，并且写明角色",
      ok: systemText.trim().length >= 12 && /你是|作为|担任/.test(systemText),
      hint: "用一句话写明它是谁，例如「你是青石书店的店员」。",
    },
    {
      id: "boundary",
      label: "系统消息里写了边界",
      ok: /不知道|不要|禁止|只|别|勿/.test(systemText),
      hint: "写上它不能做什么，例如「不知道就说不知道」。",
    },
    {
      id: "user",
      label: "至少有一条用户消息",
      ok: messages.some((message) => message.role === "user" && message.content.trim()),
      hint: "用户这次说的话放在 user，不要塞进 system。",
    },
    {
      id: "empty",
      label: "没有空消息",
      ok: messages.length > 0 && messages.every((message) => message.content.trim().length > 0),
      hint: "空消息会让这一轮接不上，也浪费上下文。",
    },
  ];
}
