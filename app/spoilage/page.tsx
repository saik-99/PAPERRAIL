"use client";

import { useState } from "react";
import { SpoilageRiskMeter } from "../components/SpoilageRiskMeter";
import { calculateSpoilageRisk } from "@/lib/utils";

export default function SpoilagePage() {
  const [humidity, setHumidity] = useState(72);
  const [temp, setTemp] = useState(30);
  const [days, setDays] = useState(3);
  const [coldStorage, setColdStorage] = useState(false);

  const level = calculateSpoilageRisk(humidity, temp, days, coldStorage);

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Spoilage risk meter
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            See how{" "}
            <span className="text-emerald-700 dark:text-emerald-400">
              weather & storage
            </span>{" "}
            change risk.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Adjust humidity, temperature and storage days to understand when
            produce is safe, needs attention, or should be sold or moved
            quickly.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr,1.1fr]">
          <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Storage conditions
            </p>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span>Humidity (%)</span>
                <span className="font-semibold">{humidity}%</span>
              </label>
              <input
                type="range"
                min={40}
                max={95}
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span>Temperature (°C)</span>
                <span className="font-semibold">{temp}°C</span>
              </label>
              <input
                type="range"
                min={18}
                max={45}
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span>Days in storage</span>
                <span className="font-semibold">{days} days</span>
              </label>
              <input
                type="range"
                min={0}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="mt-2 flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={coldStorage}
                onChange={(e) => setColdStorage(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-700"
              />
              Cold storage / refrigeration available
            </label>
          </div>

          <div className="space-y-4">
            <SpoilageRiskMeter
              level={level}
              message="Mock calculation only; final app will use live weather, crop type and storage details."
            />
            <div className="rounded-2xl border border-zinc-100 bg-white/80 p-4 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                How to read this
              </p>
              <ul className="mt-2 space-y-1 list-disc pl-4 text-zinc-600 dark:text-zinc-400">
                <li>🟢 Low: safe for normal storage; focus on price.</li>
                <li>🟡 Medium: plan sale or preservation within 2–3 days.</li>
                <li>🔴 High: act today — sell, dry, or move to cold storage.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

