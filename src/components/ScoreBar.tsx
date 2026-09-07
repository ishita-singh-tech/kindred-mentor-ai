export function ScoreBar({
  label,
  value,
  display,
  delay = 0,
}: {
  label: string;
  value: number;
  display?: string;
  delay?: number;
}) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{display ?? value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            animation: `fill 1.1s cubic-bezier(0.32,0.72,0,1) ${delay}s both`,
          }}
        />
      </div>
    </div>
  );
}
