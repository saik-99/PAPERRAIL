'use client'

import { useLanguage } from "../components/LanguageContext";
import { HelpCircle, MessageSquare, PhoneCall, FileText } from "lucide-react";

export default function AdvisoryPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-20">
        <section className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 sm:text-4xl">
            Help & Advisory
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Get expert guidance and support for your agricultural needs.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <MessageSquare className="h-6 w-6 text-emerald-600 mb-4" />
            <h3 className="font-bold mb-2">Speak to Gemini Advisor</h3>
            <p className="text-sm text-zinc-500">Ask any farming question in your local language and get AI responses.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <PhoneCall className="h-6 w-6 text-blue-600 mb-4" />
            <h3 className="font-bold mb-2">Helpline Numbers</h3>
            <p className="text-sm text-zinc-500">Kisan Call Center: 1800-180-1551 (Toll Free)</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <FileText className="h-6 w-6 text-amber-600 mb-4" />
            <h3 className="font-bold mb-2">Guides & Articles</h3>
            <p className="text-sm text-zinc-500">Best practices for sustainable and organic farming techniques.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
