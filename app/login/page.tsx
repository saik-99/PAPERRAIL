import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="min-h-screen bg-transparent px-4 py-10 font-sans text-zinc-900 dark:text-zinc-50 sm:px-8 lg:px-20">
      <main className="mx-auto flex max-w-md flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Login
          </p>
          <h1 className="text-3xl font-semibold">
            Welcome back,{" "}
            <span className="text-emerald-700 dark:text-emerald-400">
              KhetiWala
            </span>{" "}
            farmer.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sign in to your account.
          </p>
        </header>

        <form
          className="space-y-4 rounded-2xl border border-zinc-100 bg-white/80 p-5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70"
        >
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="farmer@example.com"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              required
            />
          </div>

          <button
            formAction={login}
            type="submit"
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
          >
            Login
          </button>

          {message && (
            <p className="mt-2 text-xs text-red-500 whitespace-pre-wrap">
              {message}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
