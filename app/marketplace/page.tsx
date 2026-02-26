"use client";

import { useMemo, useState } from "react";
import { MOCK_LISTINGS, MOCK_CROPS } from "@/lib/mockData";
import type { SpoilageRisk } from "@/lib/supabase";
import { ListingCard } from "../components/ListingCard";

const SPOILAGE_FILTERS: (SpoilageRisk | "All")[] = [
  "All",
  "Low",
  "Medium",
  "High",
];

export default function MarketplacePage() {
  const [selectedCropId, setSelectedCropId] = useState<number | "all">("all");
  const [selectedSpoilage, setSelectedSpoilage] =
    useState<SpoilageRisk | "All">("All");

  const listings = useMemo(() => {
    return MOCK_LISTINGS.filter((listing) => {
      const cropOk =
        selectedCropId === "all" || listing.cropId === selectedCropId;
      const spoilageOk =
        selectedSpoilage === "All" || listing.spoilage === selectedSpoilage;
      return cropOk && spoilageOk;
    });
  }, [selectedCropId, selectedSpoilage]);

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Marketplace
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Live farmer listings with spoilage-aware filters.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Browse demo listings powered by mock data. Filter by crop and
            spoilage risk to see which lots need faster action.
          </p>
        </header>

        <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Crop
            </p>
            <select
              className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              value={selectedCropId}
              onChange={(e) =>
                setSelectedCropId(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">All crops</option>
              {MOCK_CROPS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Spoilage risk
            </p>
            <div className="flex gap-2">
              {SPOILAGE_FILTERS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedSpoilage(level)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selectedSpoilage === level
                      ? "bg-emerald-700 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {level === "All" ? "All" : level}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto text-xs text-zinc-600 dark:text-zinc-400">
            Showing <span className="font-semibold">{listings.length}</span>{" "}
            listings
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              farmer={listing.farmer}
              crop={listing.crop}
              quantity={listing.quantity}
              price={listing.price}
              spoilage={listing.spoilage}
              location={listing.location}
              status={listing.status}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

