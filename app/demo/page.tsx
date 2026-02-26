export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Farmer demo
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            See how Khetiwala guides a daily sell decision.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Walk through how a small farmer uses KhetiWala each morning to
            decide whether to harvest, where to sell, and how to store crops to
            protect net profit.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Step 1 · Morning snapshot
            </p>
            <p className="mt-2 font-medium">Today&apos;s price & spoilage risk</p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Farmer selects crop and quantity. KhetiWala shows today&apos;s mandi
              price range, 5-day trend, and a simple 🟢 / 🟡 / 🔴 spoilage meter.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Step 2 · Net-profit view
            </p>
            <p className="mt-2 font-medium">Best mandi after transport</p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              KhetiWala compares nearby and distant mandis, subtracting estimated
              transport to highlight the highest net ₹/kg in green.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Step 3 · Recommended action
            </p>
            <p className="mt-2 font-medium">Sell now or wait</p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Final card suggests a single action like “Sell today at Mandi A”
              or “Wait 2 days and store using solar drying”, with a short reason.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

