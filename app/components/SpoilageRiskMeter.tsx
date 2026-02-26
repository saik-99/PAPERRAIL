import { getSpoilageColor, getSpoilageEmoji } from "@/lib/utils";

type SpoilageLevel = "Low" | "Medium" | "High";

interface SpoilageRiskMeterProps {
  level: SpoilageLevel;
  message?: string;
}

export function SpoilageRiskMeter({ level, message }: SpoilageRiskMeterProps) {
  const color = getSpoilageColor(level);
  const emoji = getSpoilageEmoji(level);

  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Spoilage risk
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <p className="text-sm font-semibold">{level} risk</p>
          {message && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: level === "Low" ? "33%" : level === "Medium" ? "66%" : "100%",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

