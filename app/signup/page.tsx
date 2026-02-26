"use client";

import { useState } from "react";

export default function SignupPage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(
      "Demo signup only. Once Supabase keys are set, this will create a secure farmer account."
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-md flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Sign up
          </p>
          <h1 className="text-3xl font-semibold">
            Create your{" "}
            <span className="text-emerald-700 dark:text-emerald-400">
              KhetiWala
            </span>{" "}
            account.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Just a name, mobile number, and a simple PIN to get started. Later
            we can add OTP and multi-language support.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-zinc-100 bg-white/80 p-5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Farmer name"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Mobile number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98xxxxxx"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Choose PIN / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="4–6 digit PIN"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
          >
            Sign up (demo)
          </button>

          {message && (
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

