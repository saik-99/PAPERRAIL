import type { SpoilageRisk } from "@/lib/supabase";
import { formatCurrency, getSpoilageEmoji } from "@/lib/utils";

interface ListingCardProps {
  farmer: string;
  crop: string;
  quantity: number;
  price: number;
  spoilage: SpoilageRisk;
  location: string;
  status: string;
}

export function ListingCard({
  farmer,
  crop,
  quantity,
  price,
  spoilage,
  location,
  status,
}: ListingCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {crop}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {farmer}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{location}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            Asking price
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(price)} / qtl
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {quantity} qtl · {status}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          Spoilage: {getSpoilageEmoji(spoilage)} {spoilage}
        </span>
        <button className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900">
          View details
        </button>
      </div>
    </article>
  );
}

