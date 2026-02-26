export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Features & flows
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Core Khetiwala MVP capabilities.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Snapshot of the KhetiWala MVP: realtime listings, AI price
            prediction, spoilage risk meter, voice assistant, and net-profit
            optimizer built for small and medium Indian farmers.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-base font-semibold">Core MVP features</h2>
            <ul className="space-y-1 list-disc pl-4 text-zinc-700 dark:text-zinc-300">
              <li>Realtime crop listing &amp; simple marketplace for farmers and buyers.</li>
              <li>Daily mandi price prediction with short rationale and confidence.</li>
              <li>Spoilage risk meter (🟢 / 🟡 / 🔴) driven by weather and storage type.</li>
              <li>Nearby mandi net-profit optimizer (price minus transport cost).</li>
              <li>Voice assistant mode for local-language Q&amp;A with explainable answers.</li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-base font-semibold">Trust & explainability</h2>
            <ul className="space-y-1 list-disc pl-4 text-zinc-700 dark:text-zinc-300">
              <li>Every recommendation shows a one-line reason in plain language.</li>
              <li>&quot;Why this?&quot; view surfaces three supporting data points.</li>
              <li>Audit-friendly logs for advisories, prices, and net-profit decisions.</li>
              <li>Human-in-the-loop gates on higher-risk automated actions.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-base font-semibold">Roadmap highlights</h2>
          <ul className="space-y-1 list-disc pl-4 text-zinc-700 dark:text-zinc-300">
            <li>Full crop-switching recommender for next-season planning.</li>
            <li>Batch logistics optimization and transport marketplace.</li>
            <li>Analytics dashboards for FPOs, NGOs, and government partners.</li>
            <li>Multi-language voice and SMS support across major Indian languages.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

