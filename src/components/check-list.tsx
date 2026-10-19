import type { Check } from "@/lib/messages";

export function CheckList({ checks }: { checks: Check[] }) {
  const ready = checks.filter((check) => check.ok).length;
  return (
    <div>
      <p className="text-sm font-medium tabular-nums">
        {ready} / {checks.length} 项就绪
      </p>
      <ul className="mt-3 space-y-3">
        {checks.map((check) => (
          <li key={check.id} className="text-sm leading-6">
            <p className={check.ok ? "text-accent-foreground" : "text-foreground"}>
              <span className="mr-2 font-medium">{check.ok ? "通过" : "还缺"}</span>
              {check.label}
            </p>
            {check.ok ? null : <p className="text-muted-foreground">{check.hint}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
