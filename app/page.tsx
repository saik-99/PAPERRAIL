'use client'

import { useState } from "react";
import { Leaf, Thermometer, Sprout, MapPin, ChevronRight } from "lucide-react";
import { useLanguage } from "./components/LanguageContext";
import { LiveClock } from "./components/LiveClock";
import { TopBar } from "./components/TopBar";
import { GeminiAdvisor } from "./components/GeminiAdvisor";
import { WeatherWidget } from "./components/WeatherWidget";
import { CropOverview } from "./components/CropOverview";
import { CropTrendsChart } from "./components/CropTrendsChart";

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
  const [harvestData, setHarvestData] = useState<any>(null);
  const [isHarvestLoading, setIsHarvestLoading] = useState(false);

  const fetchHarvestInsight = async () => {
    if (!formData.city || !formData.crop) return;
    setIsHarvestLoading(true);
    try {
      const res = await fetch('/api/harvest-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: formData.city,
          state: formData.state,
          crop: formData.crop,
          landSize: formData.landSize
        })
      });
      const data = await res.json();
      if (res.ok && !data.error) setHarvestData(data);
    } catch { } // fail silently
    finally { setIsHarvestLoading(false); }
  };

  const handlePredict = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsPredicted(true);
    setIsLoading(true);

    fetchHarvestInsight();
    try {
      const cropQuery = CROP_WPI_MAP[formData.crop] || formData.crop.toUpperCase();
      const res = await fetch('/data/wpi_summary.json');
      const allData = await res.json();

      const filtered = allData.filter((r: any) => r.commodity.toLowerCase().includes(cropQuery.toLowerCase()));

      if (filtered.length > 0) {
        const commodity = filtered[0];
        const series = commodity.series.slice(-12);

        setChartData(series);
        setChartLabel(`${commodity.commodity}`);
        if (series.length >= 3) {
          const last = series[series.length - 1].index;
          const prev = series[series.length - 3].index;
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
    <div className="flex flex-col min-h-screen relative bg-[#f4f7f4]">
      {/* Farm Background Image with Light Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2689&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed inset-0 z-0 bg-white/90 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar meta={{ greeting: '', title: 'Dashboard' }} />

        <main className="flex-1 p-4 pb-32 max-w-[1400px] mx-auto w-full">
          <div className="space-y-6">

            {/* Farm Profile Form (Compact) */}
            <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-zinc-900 tracking-widest uppercase">Your Farm</h2>
              </div>

              <div className="flex-1 flex flex-wrap gap-2 justify-end">
                <select
                  className="h-9 w-32 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                >
                  <option value="">{t('select_state')}</option>
                  {STATES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <input
                  placeholder={t('eg_nagpur')}
                  className="h-9 w-32 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.city}
                  onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                />
                <input
                  type="number" placeholder="Acres"
                  className="h-9 w-20 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.landSize}
                  onChange={e => setFormData(p => ({ ...p, landSize: e.target.value }))}
                />
                <select
                  className="h-9 w-32 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.crop}
                  onChange={e => setFormData(p => ({ ...p, crop: e.target.value }))}
                >
                  <option value="">{t('select_crop')}</option>
                  {CROPS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <button
                  onClick={handlePredict}
                  className="h-9 px-5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/40 transition-all whitespace-nowrap"
                >
                  {t('analyze_insights')}
                </button>
              </div>
            </div>

            {/* Main Application Grid */}
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <WeatherWidget
                  location={formData.city || 'Springfield, IL'}
                  dateStr="Oct 26"
                  tempC={harvestData?.weather?.temp_c || 21}
                  humidity={62}
                  description={harvestData?.weather?.condition || "Sunny"}
                />
                <CropOverview />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">

                {/* Top Right: Chart */}
                <div className="h-[400px]">
                  <CropTrendsChart />
                </div>

                {/* Bottom Right: Smart Harvest AI + Gov Schemes (Adapted to look like Market Summary) */}
                <div className="grid sm:grid-cols-2 gap-6">

                  {/* Smart Harvest AI */}
                  <div className={`rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 h-[200px] flex flex-col transition-all duration-500 hover:shadow-md hover:border-emerald-200 ${!isPredicted ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-zinc-900 tracking-widest uppercase flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-emerald-600" />
                        {t('smart_harvest_ai')}
                      </h2>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </div>

                    <div className="flex-1 flex flex-col justify-center overflow-y-auto pr-2 custom-scrollbar-light">
                      {isHarvestLoading ? (
                        <div className="flex items-center justify-center gap-3 text-xs font-semibold text-emerald-600">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          {t('analyzing_weather')}
                        </div>
                      ) : harvestData ? (
                        <p className="text-xs leading-relaxed text-zinc-600">
                          {harvestData.insight}
                        </p>
                      ) : (
                        <div className="text-xs text-zinc-400 text-center">
                          {t('enter_city_crop_ai')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gov Scheme Links */}
                  <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 h-[200px] flex flex-col hover:shadow-md hover:border-emerald-200 transition-all">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-zinc-900 tracking-widest uppercase">Market & Schemes</h2>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar-light">
                      {[
                        { title: 'PM-Kisan Samman Nidhi', link: 'https://pmkisan.gov.in/' },
                        { title: 'PM Fasal Bima Yojana', link: 'https://pmfby.gov.in/' },
                        { title: 'Kisan Credit Card', link: 'https://www.nabard.org/' },
                      ].map(s => (
                        <a key={s.title} href={s.link} target="_blank" rel="noreferrer"
                          className="flex items-center justify-between group">
                          <p className="text-xs font-medium text-zinc-600 group-hover:text-emerald-700 transition-colors border-b border-transparent group-hover:border-emerald-700">{s.title}</p>
                          <span className="text-[10px] text-emerald-600 font-bold tracking-wider">APPLY</span>
                        </a>
                      ))}
                    </div>
                  </div>

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
    </div>
  );
}
