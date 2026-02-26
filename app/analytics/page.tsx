'use client'

import { TopBar } from '../components/TopBar';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search } from 'lucide-react';

const FEATURED = ['WHEAT', 'RICE', 'MAIZE', 'ARHAR', 'GROUNDNUT', 'ONION', 'POTATO', 'COTTON'];

interface Commodity { name: string; weight: number | null; series: { month: string; index: number }[]; }

export default function AnalyticsPage() {
  const [query, setQuery] = useState('WHEAT');
  const [input, setInput] = useState('WHEAT');
  const [data, setData] = useState<Commodity | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/crop-prices?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(j => setData(j.commodities?.[0] ?? null))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar meta={{ greeting: 'Good afternoon', title: 'Market Trends' }} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap gap-2">
            {FEATURED.map(c => (
              <button key={c} onClick={() => { setQuery(c); setInput(c); }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${query === c ? 'bg-emerald-700 text-white' : 'border border-[#1a2d1a] bg-[#0a160a] text-zinc-400 hover:border-emerald-700 hover:text-emerald-400'}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="mb-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setQuery(input); }}
                placeholder="Search commodity (e.g. ONION, WHEAT)..."
                className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0a160a] pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <button onClick={() => setQuery(input)}
              className="h-10 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
              Search
            </button>
          </div>

          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          )}

          {!loading && data && (
            <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{data.name}</h2>
                  <p className="text-xs text-zinc-500">WPI Weight: {data.weight ?? 'N/A'} · Last {data.series.length} months</p>
                </div>
                <span className="rounded-full border border-emerald-800 bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                  From WPI Dataset
                </span>
              </div>
              <div className="h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2d1a" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={6} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip formatter={(v: number | undefined) => [v !== undefined ? `${v}` : '', 'WPI Index']}
                      contentStyle={{ background: '#0d1a0d', border: '1px solid #1a2d1a', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="index" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#ag)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-center text-[10px] text-zinc-600">Source: India WPI Data 2011–2017 · Kaggle</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
