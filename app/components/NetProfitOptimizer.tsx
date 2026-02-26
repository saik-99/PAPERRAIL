"use client";

import { useMemo, useState } from "react";
import { MOCK_MANDIS } from "@/lib/mockData";
import { calculateNetProfit, formatCurrency, getDistanceKm } from "@/lib/utils";

interface NetProfitOptimizerProps {
  cropPricePerQuintal: number;
  farmerLat?: number;
  farmerLon?: number;
}

export function NetProfitOptimizer({
  cropPricePerQuintal,
  farmerLat = 21.1458,
  farmerLon = 79.0882,
}: NetProfitOptimizerProps) {
  const [quantityQuintal, setQuantityQuintal] = useState(50);

  const mandiResults = useMemo(() => {
    return MOCK_MANDIS.map((mandi) => {
      const distance = getDistanceKm(farmerLat, farmerLon, mandi.lat, mandi.lng);
      const netPerQuintal = calculateNetProfit(
        cropPricePerQuintal,
        distance,
        mandi.transport_rate
      );
      const totalNet = netPerQuintal * quantityQuintal;
      return {
        ...mandi,
        distance: Math.round(distance),
        netPerQuintal,
        totalNet,
      };
    }).sort((a, b) => b.netPerQuintal - a.netPerQuintal);
  }, [cropPricePerQuintal, farmerLat, farmerLon, quantityQuintal]);

  const best = mandiResults[0];

  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Net-profit optimizer
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
            Best mandi after transport for today&apos;s price.
          </p>
        </div>
        <div className="text-right">
          <label className="block text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            Quantity (quintal)
          </label>
          <input
            type="number"
            min={1}
            value={quantityQuintal}
            onChange={(e) => setQuantityQuintal(Number(e.target.value) || 1)}
            className="mt-1 h-8 w-24 rounded-full border border-zinc-300 bg-white px-3 text-right text-xs outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      {best && (
        <div className="mt-4 rounded-xl border border-emerald-600/40 bg-emerald-600/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
            Recommended mandi
          </p>
          <p className="mt-1 text-sm font-semibold">
            {best.name} · {best.distance} km
          </p>
          <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
            Net price:{" "}
            <span className="font-semibold">
              {formatCurrency(best.netPerQuintal)}
            </span>{" "}
            per quintal · total ~{" "}
            <span className="font-semibold">
              {formatCurrency(best.totalNet)}
            </span>
          </p>
        </div>
      )}

      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {mandiResults.slice(0, 3).map((mandi) => (
          <div
            key={mandi.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-100">
                {mandi.name}
              </p>
              <p className="text-[11px] text-zinc-500">
                {mandi.distance} km · {mandi.district}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-zinc-500">Net ₹/quintal</p>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {Math.round(mandi.netPerQuintal)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

