"use client";

import { useState } from "react";
import { MOCK_CROPS, GOVERNMENT_SCHEMES, MOCK_PRICE_HISTORY } from "@/lib/mockData";
import { calculateSpoilageRisk, predictPrice } from "@/lib/utils";
import { SpoilageRiskMeter } from "../components/SpoilageRiskMeter";

interface AdvisoryResult {
  recommendation: string;
  reason: string;
  facts: string[];
}

export default function AdvisoryPage() {
  const [cropId, setCropId] = useState(2); // Tomato by default
  const [daysAhead, setDaysAhead] = useState(3);
  const [question, setQuestion] = useState("Gehu kab bechna hai?");
  const [result, setResult] = useState<AdvisoryResult | null>(null);

  function handleGetAdvice() {
    const crop = MOCK_CROPS.find((c) => c.id === cropId);
    const key = (crop?.name_en.toLowerCase() ?? "tomato") as keyof typeof MOCK_PRICE_HISTORY;
    const history = MOCK_PRICE_HISTORY[key] ?? MOCK_PRICE_HISTORY.tomato;
    const priceForecast = predictPrice(history, daysAhead);
    const spoilage = calculateSpoilageRisk(72, 30, daysAhead, false);

    const recommendation =
      priceForecast.trend === "rising"
        ? `Better to wait ${daysAhead} days before selling ${crop?.name_en ?? "crop"}.`
        : `Safer to sell ${crop?.name_en ?? "crop"} within the next 24–48 hours.`;

    const reason =
      priceForecast.trend === "rising"
        ? "Prices are trending up and spoilage risk is still manageable."
        : "Prices are not improving and storage conditions increase spoilage risk.";

    const facts = [
      `Price trend over last 7 days: ${priceForecast.trend}.`,
      `Predicted price in ${daysAhead} days: ₹${priceForecast.price}/qtl (confidence ${(priceForecast.confidence * 100).toFixed(0)}%).`,
      `Spoilage risk over this window is ${spoilage}.`,
    ];

    setResult({ recommendation, reason, facts });
  }

  const crop = MOCK_CROPS.find((c) => c.id === cropId);
  const schemes = GOVERNMENT_SCHEMES.filter(
    (s) => s.crop === "All" || s.crop === crop?.name_en
  );

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Advisory
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Mock Claude advisory, spoilage calculator & schemes.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This page uses only mock data for now. Once you add your API keys, it
            can call Claude and real weather/price feeds.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.4fr,1.1fr]">
          <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Ask for advice
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Crop
                </label>
                <select
                  className="h-9 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                  value={cropId}
                  onChange={(e) => setCropId(Number(e.target.value))}
                >
                  {MOCK_CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Days to look ahead
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(Number(e.target.value) || 1)}
                  className="h-9 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Farmer question (optional)
              </label>
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <button
              type="button"
              onClick={handleGetAdvice}
              className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
            >
              Get mock advisory
            </button>

            {result && (
              <div className="mt-4 space-y-2 rounded-2xl border border-emerald-600/40 bg-emerald-50 p-4 text-sm dark:border-emerald-400/40 dark:bg-emerald-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">
                  Recommendation
                </p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {result.recommendation}
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  {result.reason}
                </p>
                <div className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  {result.facts.map((fact, idx) => (
                    <p key={idx}>• {fact}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <SpoilageRiskMeter
              level={calculateSpoilageRisk(72, 30, daysAhead, false)}
              message="Based on humidity, temperature and storage days for a typical shed."
            />

            <div className="rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Relevant schemes
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Showing schemes for <span className="font-semibold">{crop?.name_en}</span>{" "}
                and general farmer support.
              </p>
              <ul className="mt-3 space-y-2">
                {schemes.map((s) => (
                  <li key={s.id} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {s.benefit}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {s.shortcode}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

