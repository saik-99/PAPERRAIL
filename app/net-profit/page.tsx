"use client";

import { useState } from "react";
import { NetProfitOptimizer } from "../components/NetProfitOptimizer";
import { MOCK_PRICE_HISTORY } from "@/lib/mockData";

export default function NetProfitPage() {
  const [cropKey, setCropKey] = useState<keyof typeof MOCK_PRICE_HISTORY>(
    "tomato"
  );

  const history = MOCK_PRICE_HISTORY[cropKey] ?? MOCK_PRICE_HISTORY.tomato;
  const today = history[history.length - 1] ?? 24;

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Net-profit aware
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Choose mandi by{" "}
            <span className="text-emerald-700 dark:text-emerald-400">
              net earnings
            </span>{" "}
            not just price.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This demo uses mock mandi data to show how Khetiwala subtracts
            transport cost so farmers see true ₹/quintal before deciding where
            to sell.
          </p>
        </header>

        <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Crop
            </p>
            <select
              value={cropKey}
              onChange={(e) =>
                setCropKey(e.target.value as keyof typeof MOCK_PRICE_HISTORY)
              }
              className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="tomato">Tomato</option>
              <option value="wheat">Wheat</option>
              <option value="soybean">Soybean</option>
              <option value="chana">Chana</option>
              <option value="onion">Onion</option>
            </select>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Today&apos;s mock modal price:{" "}
            <span className="font-semibold">₹{today}/qtl</span>. Distances and
            transport rates are also mock, for demo only.
          </p>
        </section>

        <NetProfitOptimizer cropPricePerQuintal={today} />
      </main>
    </div>
  );
}

