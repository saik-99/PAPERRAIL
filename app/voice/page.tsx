"use client";

import { useState } from "react";
import { MOCK_CROPS } from "@/lib/mockData";

interface Plan {
  summary: string;
  crops: string[];
  actions: string[];
}

export default function VoicePage() {
  const [landSize, setLandSize] = useState(3);
  const [state, setState] = useState("Maharashtra");
  const [crops, setCrops] = useState<number[]>([2, 4]);
  const [experience, setExperience] = useState(5);
  const [plan, setPlan] = useState<Plan | null>(null);

  function toggleCrop(id: number) {
    setCrops((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handlePlan() {
    const selected = MOCK_CROPS.filter((c) => crops.includes(c.id));
    const cropNames = selected.map((c) => c.name_en);

    const intensity =
      landSize <= 2 ? "small holding" : landSize <= 5 ? "medium farm" : "larger farm";

    const summary = `For a ${intensity} in ${state} with about ${landSize} acres, focus on ${cropNames.join(
      ", "
    )} over the coming season.`;

    const actions: string[] = [
      "Lock one main cash crop and one backup crop to spread risk.",
      "Check nearby mandi prices weekly and watch the spoilage meter before harvest.",
      "Use KhetiWala net-profit view to compare nearby and big-city mandis before booking transport.",
    ];

    if (experience <= 3) {
      actions.unshift(
        "Start with 1–2 crops only and keep at least 20–30% of land for a stable cereal like wheat or rice."
      );
    }

    const planCrops =
      cropNames.length > 0 ? cropNames : ["Tomato", "Wheat", "Chana"];

    setPlan({
      summary,
      crops: planCrops,
      actions,
    });
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg_px-20">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            AI farmer profile
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Tell KhetiWala{" "}
            <span className="text-emerald-700 dark:text-emerald-400">
              your farm story
            </span>
            .
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Answer a few simple questions about land size, state and crops you
            like. The AI will suggest a starting crop mix and actions. Later
            this will call Claude with real data.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr,1.1fr]">
          <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Your farm basics
            </p>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span>Land size (acres)</span>
                <span className="font-semibold">{landSize} acres</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.5}
                value={landSize}
                onChange={(e) => setLandSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-9 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option>Maharashtra</option>
                <option>Uttar Pradesh</option>
                <option>Madhya Pradesh</option>
                <option>Gujarat</option>
                <option>Punjab</option>
                <option>Bihar</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Crops you want to grow
              </label>
              <div className="flex flex-wrap gap-2">
                {MOCK_CROPS.map((c) => {
                  const selected = crops.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCrop(c.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        selected
                          ? "bg-emerald-700 text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {c.name_en}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span>Farming experience (years)</span>
                <span className="font-semibold">{experience} years</span>
              </label>
              <input
                type="range"
                min={0}
                max={30}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={handlePlan}
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
            >
              Generate mock AI plan
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Suggested plan (demo)
            </p>
            {!plan && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Fill the details on the left and click &quot;Generate mock AI
                plan&quot; to see a sample recommendation.
              </p>
            )}
            {plan && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {plan.summary}
                </p>
                <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  <p className="font-semibold">Focus crops</p>
                  <p>{plan.crops.join(", ")}</p>
                </div>
                <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                  <p className="font-semibold">Next actions</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {plan.actions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

