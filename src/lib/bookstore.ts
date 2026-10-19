export type Chunk = {
  id: string;
  title: string;
  text: string;
};

export type Hit = Chunk & { score: number };

export const MIN_SCORE = 0.2;

export const chunks: Chunk[] = [
  {
    id: "hours",
    title: "营业时间",
    text: "青石书店营业时间：周一至周五 9:00–22:00，周六和周日 10:00–21:00。法定节假日以门店公告为准。",
  },
  {
    id: "returns",
    title: "退货",
    text: "未拆封图书可在签收后 7 天内退货。已涂写、缺页或套装缺件不支持退货。质量问题由书店承担退货运费，其他情况运费由买家承担。",
  },
  {
    id: "member",
    title: "会员折扣",
    text: "会员用手机号绑定。普通会员全单 95 折，年费会员全单 9 折。会员折扣不与满减同享。",
  },
  {
    id: "address",
    title: "地址",
    text: "青石书店在杭州市西湖区龙井路 18 号。地铁 3 号线龙井站 B 口步行约 6 分钟。店门口没有停车场。",
  },
  {
    id: "events",
    title: "新书分享",
    text: "每周三 19:30 有新书分享，需要提前一天在小程序预约，名额 30 人。未预约不能入场。",
  },
  {
    id: "shipping",
    title: "运费",
    text: "杭州同城订单满 99 元免运费，其他城市满 69 元免运费。偏远地区是否包邮以结算页为准。",
  },
];

export const ragPresets = [
  "周末几点关门？",
  "会员打几折？能和满减一起用吗？",
  "你们卖咖啡吗？",
  "龙井路店怎么去？",
];

function features(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const add = (token: string, weight: number) => {
    if (!token) return;
    map.set(token, (map.get(token) ?? 0) + weight);
  };
  for (const word of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) add(word, 2);
  const chars = [...text].filter((char) => /[\u4e00-\u9fff]/.test(char));
  for (const char of chars) add(char, 0.35);
  for (let index = 0; index < chars.length - 1; index += 1) {
    add(chars[index] + chars[index + 1], 1);
  }
  return map;
}

/** Share of the query's weight that also appears in the document. Long chunks no longer drown a short question. */
function coverage(query: Map<string, number>, document: Map<string, number>): number {
  let hit = 0;
  let total = 0;
  for (const [token, weight] of query) {
    total += weight;
    if (document.has(token)) hit += weight;
  }
  if (total === 0) return 0;
  return hit / total;
}

export function rewriteQuery(query: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  const extra: string[] = [];
  const add = (when: boolean, words: string, why: string) => {
    if (!when) return;
    extra.push(words);
    notes.push(why);
  };
  add(/周末/.test(query), "周六 周日", "「周末」和资料里的「周六和周日」字面不同，补了同义说法。");
  add(/几点|开门|关门/.test(query), "营业时间", "把「几点开门或关门」改写成资料里的「营业时间」。");
  add(/几折|打折|折扣/.test(query), "会员 折扣", "问折扣时补上「会员」。");
  add(/在哪|怎么走|怎么去|地址/.test(query), "龙井路 地址", "问路时补上地址。");
  add(/退货|退款|能退|拆封|退几/.test(query), "退货 未拆封", "退款、拆封、能退统一到资料里的「退货」。");
  add(/包邮|运费/.test(query), "运费", "包邮统一到「运费」。");
  add(/分享会|活动|预约/.test(query), "新书分享", "活动统一到「新书分享」。");
  return { text: [query, ...extra].join(" "), notes };
}

const vectors = chunks.map((chunk) => ({
  chunk,
  vector: features(`${chunk.title} ${chunk.text}`),
}));

export function retrieve(query: string, k = 3): { hits: Hit[]; rewrite: ReturnType<typeof rewriteQuery> } {
  const rewrite = rewriteQuery(query);
  const queryVector = features(rewrite.text);
  const hits = vectors
    .map(({ chunk, vector }) => ({
      ...chunk,
      score: coverage(queryVector, vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  return { hits, rewrite };
}

export function usableHits(hits: Hit[]): Hit[] {
  return hits.filter((hit) => hit.score >= MIN_SCORE);
}

export function citeAnswer(used: Hit[]): string {
  if (used.length === 0) return "不知道。提供的资料里没有这件事。";
  return used.map((hit, index) => `[${index + 1}] ${hit.text}`).join("\n");
}

export function buildPrompt(query: string, used: Hit[]): string {
  const docs = used.length
    ? used.map((hit, index) => `[${index + 1}] ${hit.title}\n${hit.text}`).join("\n\n")
    : "（没有检索到资料）";
  return [
    "系统：只根据「资料」回答。资料没有的内容，回答「不知道」。不要用资料以外的常识补全。回答里保留资料编号。",
    "",
    "资料：",
    docs,
    "",
    `用户：${query}`,
  ].join("\n");
}
