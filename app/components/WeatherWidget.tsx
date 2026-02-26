interface WeatherWidgetProps {
  tempC: number;
  humidity: number;
  description: string;
}

export function WeatherWidget({
  tempC,
  humidity,
  description,
}: WeatherWidgetProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Weather snapshot
      </p>
      <p className="mt-2 text-lg font-semibold">
        {tempC}°C{" "}
        <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">
          · {description}
        </span>
      </p>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Humidity {humidity}% — important for spoilage and storage choice.
      </p>
    </div>
  );
}

