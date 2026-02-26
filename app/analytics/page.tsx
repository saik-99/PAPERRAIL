import { MOCK_LISTINGS, MOCK_PRICE_HISTORY } from "@/lib/mockData";
import { predictPrice } from "@/lib/utils";

export default function AnalyticsPage() {
  const totalListings = MOCK_LISTINGS.length;
  const highRisk = MOCK_LISTINGS.filter((l) => l.spoilage === "High").length;
  const districts = new Set(MOCK_LISTINGS.map((l) => l.location));

  const cropsAnalytics = Object.entries(MOCK_PRICE_HISTORY).map(
    ([crop, history]) => {
      const today = history[history.length - 1];
      const forecast = predictPrice(history, 5);
      return {
        crop,
        today,
        forecast,
      };
    }
  );

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Analytics
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Simple supply, risk & price outlook.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This mock analytics view gives a flavour of the FPO / government
            dashboard using the same demo dataset as the farmer screens.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Active listings
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalListings}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Across {districts.size} districts in the mock dataset.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              High spoilage risk
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">
              {highRisk}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Lots that should be prioritized for storage or sale.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Crops tracked
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {Object.keys(MOCK_PRICE_HISTORY).length}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              With 15-day price history for demo forecasting.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-100 bg-white/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Price outlook (next 5 days)
          </p>
          <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
            {cropsAnalytics.map(({ crop, today, forecast }) => (
              <div
                key={crop}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-semibold capitalize">{crop}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    Today: ₹{today}/qtl
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-zinc-500">
                    In 5 days ({forecast.trend})
                  </p>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    ₹{forecast.price}/qtl
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    Confidence {(forecast.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

