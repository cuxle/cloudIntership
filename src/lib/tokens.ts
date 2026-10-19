/** Rough teaching estimate. Real bills use the model's tokenizer. */
export function estimateTokens(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const rest = Math.max(0, text.length - cjk);
  return Math.max(text.trim() ? 1 : 0, Math.ceil(cjk * 1.4 + rest / 4));
}

export function countChars(text: string): { cjk: number; other: number } {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  return { cjk, other: Math.max(0, text.length - cjk) };
}
