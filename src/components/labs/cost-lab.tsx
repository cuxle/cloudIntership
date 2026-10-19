"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatUsd, monthlyCost } from "@/lib/cost";

export function CostLab() {
  const [requestsPerDay, setRequestsPerDay] = useState(2000);
  const [inputTokens, setInputTokens] = useState(1800);
  const [outputTokens, setOutputTokens] = useState(250);
  const [inputPrice, setInputPrice] = useState(1);
  const [outputPrice, setOutputPrice] = useState(4);
  const [routedShare, setRoutedShare] = useState(0.8);

  const cost = useMemo(
    () => monthlyCost({ requestsPerDay, inputTokens, outputTokens, inputPrice, outputPrice, routedShare }),
    [requestsPerDay, inputTokens, outputTokens, inputPrice, outputPrice, routedShare],
  );
  const saved = Math.max(0, cost.full - cost.routed);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="每天请求" value={requestsPerDay} min={0} max={100000} step={100} onChange={setRequestsPerDay} />
        <NumberField label="平均输入 token" value={inputTokens} min={0} max={32000} step={50} onChange={setInputTokens} />
        <NumberField label="平均输出 token" value={outputTokens} min={0} max={8000} step={10} onChange={setOutputTokens} />
        <NumberField label="输入单价 / 百万 token" value={inputPrice} min={0} max={30} step={0.5} onChange={setInputPrice} prefix="$" />
        <NumberField label="输出单价 / 百万 token" value={outputPrice} min={0} max={60} step={0.5} onChange={setOutputPrice} prefix="$" />
        <label className="text-sm sm:col-span-2">
          <span className="font-medium">小模型处理 {Math.round(routedShare * 100)}% 的请求</span>
          <Input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={routedShare}
            onChange={(event) => setRoutedShare(Number(event.target.value))}
            className="mt-2 px-0"
          />
        </label>
      </div>
      <dl className="grid gap-3">
        <Money label="全部走大模型 / 月" value={formatUsd(cost.full)} />
        <Money label="路由之后 / 月" value={formatUsd(cost.routed)} />
        <Money label="大约少花" value={formatUsd(saved)} />
      </dl>
      <p className="text-sm leading-7 text-muted-foreground lg:col-span-2">
        示意单价，不是哪家供应商的报价。小模型按大模型一成计价。检索进来的资料算在输入里，所以输入框比输出框更值得先看。单次请求大约 {formatUsd(cost.perRequest)}。
      </p>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        {prefix ? <span className="text-muted-foreground">{prefix}</span> : null}
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-10 bg-background"
        />
      </span>
    </label>
  );
}

function Money({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background px-3 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-serif text-3xl tabular-nums">{value}</dd>
    </div>
  );
}
