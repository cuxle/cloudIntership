export type CostInput = {
  requestsPerDay: number;
  inputTokens: number;
  outputTokens: number;
  inputPrice: number;
  outputPrice: number;
  routedShare: number;
};

export function monthlyCost(input: CostInput) {
  const requests = clamp(input.requestsPerDay, 0, 1_000_000);
  const inputTokens = clamp(input.inputTokens, 0, 200_000);
  const outputTokens = clamp(input.outputTokens, 0, 200_000);
  const inputPrice = clamp(input.inputPrice, 0, 100);
  const outputPrice = clamp(input.outputPrice, 0, 100);
  const share = clamp(input.routedShare, 0, 1);
  const perRequest = (inputTokens * inputPrice + outputTokens * outputPrice) / 1_000_000;
  const full = requests * 30 * perRequest;
  const smallFactor = 0.1;
  const routed = requests * 30 * (share * perRequest * smallFactor + (1 - share) * perRequest);
  return { perRequest, full, routed, smallFactor };
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function formatUsd(value: number): string {
  if (value >= 100) return `$${value.toFixed(0)}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}
