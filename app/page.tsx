'use client'

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Leaf } from "lucide-react";
import { useLanguage } from "./components/LanguageContext";
import { LiveClock } from "./components/LiveClock";
import { TopBar } from "./components/TopBar";
import { GeminiAdvisor } from "./components/GeminiAdvisor";

interface ChartPoint { month: string; index: number; }

const FALLBACK_DATA: ChartPoint[] = [
  { month: 'Apr-11', index: 100 }, { month: 'Jul-11', index: 104 },
  { month: 'Oct-11', index: 107 }, { month: 'Jan-12', index: 112 },
  { month: 'Apr-12', index: 118 }, { month: 'Jul-12', index: 125 },
];

const CROP_WPI_MAP: Record<string, string> = {
  wheat: 'WHEAT', rice: 'RICE', cotton: 'COTTON',
  soyabean: 'OIL SEEDS', onion: 'ONION', tomato: 'TOMATO',
};

const CROPS = ['wheat', 'rice', 'cotton', 'onion', 'tomato', 'soyabean'];
const STATES = ['maharashtra', 'punjab', 'up', 'mp', 'gujarat', 'rajasthan'];

export default function Home() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ state: '', city: '', landSize: '', crop: '' });
  const [isPredicted, setIsPredicted] = useState(false);
  const [chartData, setChartData] = useState<ChartPoint[]>(FALLBACK_DATA);
  const [chartLabel, setChartLabel] = useState('Sample WPI Index');
  const [isLoading, setIsLoading] = useState(false);
  const [sellSignal, setSellSignal] = useState<'BUY' | 'HOLD' | 'SELL' | null>(null);

  const handlePredict = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPredicted(true);
    setIsLoading(true);
    try {
      const cropQuery = CROP_WPI_MAP[formData.crop] || formData.crop.toUpperCase();
      const res = await fetch(`/api/crop-prices?q=${encodeURIComponent(cropQuery)}`);
      const json = await res.json();
      if (json.commodities?.length > 0) {
        const commodity = json.commodities[0];
        setChartData(commodity.series);
        setChartLabel(`${commodity.name}`);
        const s = commodity.series;
        if (s.length >= 3) {
          const last = s[s.length - 1].index;
          const prev = s[s.length - 3].index;
          if (last > prev * 1.02) setSellSignal('BUY');
          else if (last < prev * 0.98) setSellSignal('SELL');
          else setSellSignal('HOLD');
        }
      } else {
        setChartData(FALLBACK_DATA);
        setChartLabel('WPI Index (general)');
      }
    } catch { setChartData(FALLBACK_DATA); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar meta={{ greeting: '', title: 'Dashboard' }} />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Live clock + Season */}
          <div className="rounded-xl border border-[#1a2d1a] bg-[#0a160a] px-4 py-3">
            <LiveClock />
          </div>

          {/* Farm Profile Form */}
          <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-500" />
              <h2 className="font-bold text-white">Your Farm Profile</h2>
            </div>
            <form onSubmit={handlePredict} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">State</label>
                <select
                  className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                >
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">City / Village</label>
                <input
                  placeholder="e.g. Nagpur"
                  className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  value={formData.city}
                  onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">Land Size (acres)</label>
                <input
                  type="number" placeholder="e.g. 5"
                  className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  value={formData.landSize}
                  onChange={e => setFormData(p => ({ ...p, landSize: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">Main Crop</label>
                <select
                  className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  value={formData.crop}
                  onChange={e => setFormData(p => ({ ...p, crop: e.target.value }))}
                >
                  <option value="">Select Crop</option>
                  {CROPS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className="sm:col-span-2 lg:col-span-4 h-10 rounded-xl bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Analyze AI Insights →
              </button>
            </form>
          </div>

          {/* Price Chart + Market data */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* WPI Chart */}
            <div className={`rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5 transition-all duration-500 ${!isPredicted ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    {chartLabel}
                  </h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">WPI Price Index · India 2011–2017</p>
                </div>
                {sellSignal && (
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${sellSignal === 'BUY' ? 'bg-emerald-900/50 text-emerald-400' :
                    sellSignal === 'SELL' ? 'bg-red-900/50 text-red-400' :
                      'bg-amber-900/50 text-amber-400'
                    }`}>
                    {sellSignal === 'BUY' ? <TrendingUp className="h-3 w-3" /> : sellSignal === 'SELL' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {sellSignal}
                  </span>
                )}
              </div>
              <div className="h-52 min-h-[200px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2d1a" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} dy={6} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
                      <Tooltip formatter={(v: number | undefined) => [v !== undefined ? `${v}` : '', 'WPI Index']}
                        contentStyle={{ background: '#0d1a0d', border: '1px solid #1a2d1a', borderRadius: '8px', fontSize: '11px' }}
                        labelStyle={{ color: '#a3a3a3' }}
                      />
                      <Area type="monotone" dataKey="index" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#emeraldGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Gov Scheme Quick Links */}
            <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-white">🏛️ Quick Links — Government Schemes</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">Based on your land: {formData.landSize || '?'} acres · {formData.state || 'your state'}</p>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'PM-Kisan Samman Nidhi', desc: '₹6,000/year income support', link: 'https://pmkisan.gov.in/' },
                  { title: 'PM Fasal Bima Yojana', desc: 'Crop insurance from 1.5%', link: 'https://pmfby.gov.in/' },
                  { title: 'Kisan Credit Card', desc: 'Loan at 4% for farmers', link: 'https://www.nabard.org/' },
                ].map(s => (
                  <a key={s.title} href={s.link} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-4 py-3 hover:border-emerald-700 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-white">{s.title}</p>
                      <p className="text-[11px] text-zinc-500">{s.desc}</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">Apply →</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Gemini Advisor context */}
          <GeminiAdvisor context={{
            state: formData.state, city: formData.city,
            landSize: formData.landSize, crop: formData.crop,
            wpiIndex: chartData.length > 0 ? `${chartData[chartData.length - 1].index} (${chartLabel})` : 'not fetched',
          }} />
        </div>
      </main>
    </div>
  );
}
