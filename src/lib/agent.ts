import { chunks } from "@/lib/bookstore";

export type TraceStep =
  | { kind: "decide"; text: string }
  | { kind: "tool"; name: "get_store_fact" | "calculate"; args: Record<string, string>; result: string }
  | { kind: "answer"; text: string };

export const toolSchemas = [
  {
    name: "get_store_fact",
    description: "查询青石书店的营业、退货、会员、地址、运费或活动。",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["hours", "returns", "member", "address", "shipping", "events"],
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "calculate",
    description: "计算四则运算。金额不要让模型心算。",
    parameters: {
      type: "object",
      properties: { expression: { type: "string" } },
      required: ["expression"],
    },
  },
] as const;

export const agentPresets = [
  "一本 68 元的书打九折后是多少？周末营业到几点？",
  "按年费会员，80 元的书要付多少？",
  "未拆封的书几天内能退？",
  "帮我写一首关于西湖的诗。",
];

const topicPatterns: { id: string; pattern: RegExp }[] = [
  { id: "hours", pattern: /几点|开门|关门|营业|周末|周六|周日/ },
  { id: "returns", pattern: /退货|退款|能退|几天内/ },
  { id: "member", pattern: /会员|折扣|几折|打折|满减/ },
  { id: "address", pattern: /地址|在哪|怎么走|怎么去|龙井/ },
  { id: "shipping", pattern: /运费|包邮/ },
  { id: "events", pattern: /活动|分享|周三|预约/ },
];

const cnDigit: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

export function safeCalculate(expression: string): number | null {
  const compact = expression.replace(/\s+/g, "");
  if (!/^\d+(\.\d+)?([+\-*/]\d+(\.\d+)?)*$/.test(compact)) return null;
  const tokens = compact.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.length % 2 === 0) return null;
  const values: number[] = [Number(tokens[0])];
  const operators: string[] = [];
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const value = Number(tokens[index + 1]);
    if (!Number.isFinite(value)) return null;
    if (operator === "*" || operator === "/") {
      const previous = values.pop();
      if (previous === undefined || (operator === "/" && value === 0)) return null;
      values.push(operator === "*" ? previous * value : previous / value);
    } else {
      operators.push(operator);
      values.push(value);
    }
  }
  let result = values[0];
  for (let index = 0; index < operators.length; index += 1) {
    const next = values[index + 1];
    result = operators[index] === "+" ? result + next : result - next;
  }
  if (!Number.isFinite(result)) return null;
  return Math.round(result * 100) / 100;
}

function parseZhe(query: string): number | null {
  const numeric = query.match(/(\d+(?:\.\d+)?)\s*折/);
  if (numeric) {
    const value = Number(numeric[1]);
    return value >= 10 ? value / 100 : value / 10;
  }
  const chinese = query.match(/([一二三四五六七八九])([一二三四五六七八九])?\s*折/);
  if (!chinese) return null;
  const major = cnDigit[chinese[1]];
  if (chinese[2]) return (major * 10 + cnDigit[chinese[2]]) / 100;
  return major / 10;
}

function detectExpression(query: string): string | null {
  const arithmetic = query.match(/(\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)+)/);
  if (arithmetic) return arithmetic[1].replace(/\s+/g, "");
  const price = query.match(/(\d+(?:\.\d+)?)\s*元/);
  if (!price) return null;
  const zhe = parseZhe(query);
  if (zhe) return `${price[1]}*${zhe}`;
  if (/年费/.test(query)) return `${price[1]}*0.9`;
  if (/普通会员/.test(query)) return `${price[1]}*0.95`;
  return null;
}

function detectTopics(query: string): string[] {
  return topicPatterns.filter((topic) => topic.pattern.test(query)).map((topic) => topic.id);
}

export function runAgent(question: string): TraceStep[] {
  const query = question.trim();
  if (!query) return [];
  const topics = detectTopics(query);
  const expression = detectExpression(query);
  if (topics.length === 0 && !expression) {
    return [
      {
        kind: "decide",
        text: "对照工具清单：只能查青石书店的资料，或做四则运算。这件事两边都用不上，所以停止，不编造。",
      },
      {
        kind: "answer",
        text: "我只能查青石书店的资料，或做四则运算。这件事我做不到。",
      },
    ];
  }

  const decide = expression && topics.length > 0
    ? "有的调用互不依赖，真实接口里可以同一轮并行发出。下面按顺序展示：先取资料，再计算。数字不让模型心算。"
    : expression
      ? "数字交给计算器。折扣如果来自用户说的「九折」或会员等级，就写成算式，而不是让模型口算。"
      : "先取资料，再根据资料回答。资料里没有的内容不要补。";

  const steps: TraceStep[] = [{ kind: "decide", text: decide }];
  const factLines: string[] = [];
  for (const topic of topics) {
    const chunk = chunks.find((item) => item.id === topic);
    const result = chunk?.text ?? "没有这条资料。";
    steps.push({
      kind: "tool",
      name: "get_store_fact",
      args: { topic },
      result,
    });
    if (chunk) factLines.push(chunk.text);
  }

  let calcLine = "";
  if (expression) {
    const value = safeCalculate(expression);
    const result = value === null ? "这个算式不在允许的四则运算里。" : String(value);
    steps.push({
      kind: "tool",
      name: "calculate",
      args: { expression },
      result,
    });
    if (value !== null) calcLine = `计算结果是 ${expression} = ${value}。`;
  }

  const answer = [calcLine, ...factLines].filter(Boolean).join("");
  steps.push({
    kind: "answer",
    text: answer || "工具没有返回可用结果。",
  });
  return steps;
}
