import Link from "next/link";
import { SpoilageRiskMeter } from "./components/SpoilageRiskMeter";
import { NetProfitOptimizer } from "./components/NetProfitOptimizer";
import { WeatherWidget } from "./components/WeatherWidget";
import { predictPrice } from "@/lib/utils";
import { MOCK_PRICE_HISTORY } from "@/lib/mockData";

export default function Home() {
  const tomatoHistory = MOCK_PRICE_HISTORY.tomato ?? [];
  const tomatoToday =
    tomatoHistory.length > 0 ? tomatoHistory[tomatoHistory.length - 1] : 24;

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8 lg:px-20">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Khetiwala
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Farmer-first AI to{" "}
            <span className="text-emerald-700 dark:text-emerald-400">
              maximize income
            </span>{" "}
            and cut spoilage.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Khetiwala combines mandi prices, weather, and simple explainable AI
            to help Indian farmers decide{" "}
            <span className="font-semibold">when to harvest</span>,{" "}
            <span className="font-semibold">where to sell</span>, and{" "}
            <span className="font-semibold">how to store</span> their produce
            for the best net profit.
          </p>
        </section>

        <section className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
          >
            Start farmer demo
          </Link>
          <Link
            href="/features"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            View features &amp; flows
          </Link>
        </section>

        <section className="mt-10 grid gap-4 border-t border-zinc-100 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:grid-cols-3">
          <Link href="/net-profit" className="group block rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Net-profit aware
            </p>
            <p className="mt-1">
              Compares mandi price with transport cost so farmers see{" "}
              <span className="font-semibold">true earnings per kg</span>.
            </p>
            <p className="mt-3 text-xs font-semibold text-emerald-700 group-hover:underline">
              Open net-profit demo →
            </p>
          </Link>
          <Link href="/spoilage" className="group block rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Spoilage risk meter
            </p>
            <p className="mt-1">
              Simple 🟢 / 🟡 / 🔴 indicator with{" "}
              <span className="font-semibold">ranked storage actions</span> to
              reduce losses.
            </p>
            <p className="mt-3 text-xs font-semibold text-emerald-700 group-hover:underline">
              Explore spoilage scenarios →
            </p>
          </Link>
          <Link href="/voice" className="group block rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              AI farmer profile
            </p>
            <p className="mt-1">
              Answer a few questions about land size, state and crops so KhetiWala
              can personalise advice for your farm.
            </p>
            <p className="mt-3 text-xs font-semibold text-emerald-700 group-hover:underline">
              Open AI profile setup →
            </p>
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <NetProfitOptimizer cropPricePerQuintal={tomatoToday} />
          <div className="space-y-4">
            <SpoilageRiskMeter
              level="Medium"
              message="Humidity and storage days suggest acting within 2–3 days."
            />
            <WeatherWidget
              tempC={28}
              humidity={72}
              description="Partly cloudy over Nagpur"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
