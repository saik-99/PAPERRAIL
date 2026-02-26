import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80 sm:px-8 lg:px-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400"
        >
          KhetiWala
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
          <Link
            href="/marketplace"
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Marketplace
          </Link>
          <Link
            href="/advisory"
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Advisory
          </Link>
          <Link
            href="/analytics"
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Analytics
          </Link>
          <Link
            href="/login"
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}

