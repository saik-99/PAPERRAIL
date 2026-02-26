'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '../components/TopBar';
import { INDIAN_STATES, COMMON_CROPS } from '@/lib/soilData';
import { CITY_COORDINATES } from '@/lib/weatherUtils';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
    ChevronDown, ChevronUp, Loader2, Leaf, CloudSun, TrendingUp, MapPin,
    Info, CheckCircle2, Clock, XCircle, Thermometer, Droplets, Wind,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Mandi {
    name: string; distance: number; transportCostPerQ: number;
    avgPrice: number; priceMin: number; priceMax: number;
    netProfit: number; specialty: string;
}

interface ForecastDay {
    dayLabel: string; tempMax: number; tempMin: number;
    humidity: number; rain: number; weatherLabel: string; harvestRisk: string;
}

interface HarvestRecommendation {
    harvestDecision: 'HARVEST_NOW' | 'WAIT_DAYS' | 'NOT_READY';
    waitDays: number;
    confidence: number;
    plainSummary: string;
    weatherReason: string;
    priceReason: string;
    soilReason: string;
    actionPlan: string[];
    bestMandiName: string;
    bestMandiReason: string;
    harvestWindowEmoji: string;
    urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ApiResponse {
    success: boolean;
    recommendation: HarvestRecommendation;
    data: {
        weather: {
            current: { temp: number; humidity: number; windSpeed: number; weatherLabel: string };
            harvestWindowScore: number;
            harvestWindowLabel: string;
            rainDaysNext7: number;
            avgHumidityNext7: number;
            forecast: ForecastDay[];
        };
        soil: {
            soilType: string; pH: number; phStatus: string; organicMatter: string;
            drainage: string; healthScore: number; cropSuitability: string; notes: string;
        };
        price: {
            commodity: string; change: number; direction: string;
            seasonalScore: number; insight: string; peakMonth: string;
            latestIndex: number; trend12m: { month: string; index: number }[];
        } | null;
        seasonal: { seasonLabel: string; isOptimalSeason: boolean; priceExpectation: string };
        msp: { msp: number; unit: string } | null;
        mandis: Mandi[];
    };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ExpandableReason({ title, icon, children }: {
    title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-[#1a2d1a] bg-[#0a160a] overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#0d1a0d] transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400">{icon}</span>
                    <span className="text-sm font-semibold text-zinc-200">{title}</span>
                </div>
                {open
                    ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />}
            </button>
            {open && (
                <div className="px-4 pb-4 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-[#1a2d1a]">
                    {children}
                </div>
            )}
        </div>
    );
}

function DataSourcePill({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/60 px-2.5 py-1 text-[10px] text-zinc-400 border border-zinc-700/50">
            <Info className="h-2.5 w-2.5" />{label}
        </span>
    );
}

function ConfidenceBar({ pct }: { pct: number }) {
    const color = pct >= 70 ? '#22c55e' : pct >= 45 ? '#f59e0b' : '#ef4444';
    return (
        <div className="mt-2">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>AI Confidence</span>
                <span style={{ color }}>{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HarvestAdvisorPage() {
    const [crop, setCrop] = useState('Wheat');
    const [state, setState] = useState('Punjab');
    const [city, setCity] = useState('Ludhiana');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ApiResponse | null>(null);
    const [error, setError] = useState('');

    const cities = Object.entries(CITY_COORDINATES)
        .filter(([, v]) => !state || v.state === state)
        .map(([name]) => name)
        .sort();

    const getAdvice = useCallback(async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await fetch('/api/harvest-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ crop, state, city }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
            setResult(data);
        } catch (e) {
            setError('Could not fetch advice. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [crop, state, city]);

    const rec = result?.recommendation;
    const weatherData = result?.data.weather;
    const soilData = result?.data.soil;
    const priceData = result?.data.price;
    const mandis = result?.data.mandis ?? [];

    const decisionConfig = {
        HARVEST_NOW: {
            bg: 'border-emerald-800/50 bg-emerald-950/20',
            badge: 'bg-emerald-700 text-white',
            label: 'HARVEST NOW',
            subLabel: 'Conditions are good. Time to act.',
            icon: <CheckCircle2 className="h-7 w-7 text-emerald-400" />,
        },
        WAIT_DAYS: {
            bg: 'border-amber-800/50 bg-amber-950/10',
            badge: 'bg-amber-600 text-white',
            label: `WAIT ${rec?.waitDays ?? 0} DAYS`,
            subLabel: 'Better conditions expected soon.',
            icon: <Clock className="h-7 w-7 text-amber-400" />,
        },
        NOT_READY: {
            bg: 'border-red-800/50 bg-red-950/10',
            badge: 'bg-red-700 text-white',
            label: 'NOT READY YET',
            subLabel: 'Crop needs more time in field.',
            icon: <XCircle className="h-7 w-7 text-red-400" />,
        },
    };

    const cfg = rec ? decisionConfig[rec.harvestDecision] : null;

    return (
        <div className="flex flex-col min-h-screen bg-[#050e05]">
            <TopBar meta={{ greeting: '', title: 'AI Harvest Advisor' }} />

            <main className="flex-1 p-4 md:p-6">
                <div className="mx-auto max-w-5xl space-y-5">

                    {/* ── Setup Card ─────────────────────────────────────────────── */}
                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-xl">🌾</span>
                            <div>
                                <h2 className="font-bold text-white text-base">Get Your Harvest Advice</h2>
                                <p className="text-xs text-zinc-500">AI uses live weather + soil data + price trends to advise you</p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {/* Crop */}
                            <div>
                                <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Your Crop</p>
                                <select
                                    value={crop}
                                    onChange={e => setCrop(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                >
                                    {COMMON_CROPS.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* State */}
                            <div>
                                <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Your State</p>
                                <select
                                    value={state}
                                    onChange={e => { setState(e.target.value); setCity(''); }}
                                    className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                >
                                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Nearest City</p>
                                <select
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                >
                                    {cities.length === 0
                                        ? <option value="">Select state first</option>
                                        : cities.map(c => <option key={c}>{c}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={getAdvice}
                            disabled={loading}
                            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                        >
                            {loading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing live data...</>
                                : <><Leaf className="h-4 w-4" /> Get AI Harvest Advice</>}
                        </button>

                        {/* Data Source Pills */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            <DataSourcePill label="Open-Meteo Weather" />
                            <DataSourcePill label="WPI Price Index" />
                            <DataSourcePill label="ICAR Soil Data" />
                            <DataSourcePill label="Google Gemini AI" />
                        </div>
                    </div>

                    {/* ── Error ──────────────────────────────────────────────────── */}
                    {error && (
                        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ── Results ────────────────────────────────────────────────── */}
                    {result && rec && cfg && (
                        <>
                            {/* HARVEST WINDOW DECISION CARD */}
                            <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 shrink-0">
                                        {cfg.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-2xl">{rec.harvestWindowEmoji}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${rec.urgencyLevel === 'HIGH' ? 'border-red-700 bg-red-950/30 text-red-300' : rec.urgencyLevel === 'MEDIUM' ? 'border-amber-700 bg-amber-950/30 text-amber-300' : 'border-zinc-700 bg-zinc-900/30 text-zinc-300'}`}>
                                                {rec.urgencyLevel} URGENCY
                                            </span>
                                        </div>
                                        <p className="text-base font-semibold text-white leading-snug">{rec.plainSummary}</p>
                                        <ConfidenceBar pct={rec.confidence} />
                                    </div>
                                </div>

                                {/* Action Plan */}
                                {rec.actionPlan.length > 0 && (
                                    <div className="mt-4 rounded-xl border border-[#1a2d1a] bg-black/20 p-3">
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">📋 Your Action Plan</p>
                                        <ol className="space-y-1.5">
                                            {rec.actionPlan.map((step, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-[9px] font-bold text-emerald-400 mt-0.5">{i + 1}</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {/* Why? Expandable Sections */}
                                <div className="mt-4 space-y-2">
                                    <ExpandableReason title="Weather Analysis" icon={<CloudSun className="h-4 w-4" />}>
                                        {rec.weatherReason}
                                    </ExpandableReason>
                                    <ExpandableReason title="Price & Market Analysis" icon={<TrendingUp className="h-4 w-4" />}>
                                        {rec.priceReason}
                                        {result.data.seasonal && (
                                            <p className="mt-2 text-emerald-400 text-xs">
                                                📅 Season: {result.data.seasonal.seasonLabel} — {result.data.seasonal.priceExpectation}
                                            </p>
                                        )}
                                    </ExpandableReason>
                                    <ExpandableReason title="Soil & Land Analysis" icon={<Leaf className="h-4 w-4" />}>
                                        {rec.soilReason}
                                        {soilData && (
                                            <p className="mt-2 text-zinc-500 text-xs italic">{soilData.notes}</p>
                                        )}
                                    </ExpandableReason>
                                </div>
                            </div>

                            {/* WEATHER + SOIL SNAPSHOT ROW */}
                            <div className="grid gap-5 md:grid-cols-2">

                                {/* Weather Card */}
                                {weatherData && (
                                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <CloudSun className="h-4 w-4 text-sky-400" />
                                            <h3 className="font-bold text-white text-sm">Live Weather</h3>
                                            <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${weatherData.harvestWindowLabel === 'Excellent' ? 'bg-emerald-900 text-emerald-300' : weatherData.harvestWindowLabel === 'Good' ? 'bg-blue-900 text-blue-300' : weatherData.harvestWindowLabel === 'Fair' ? 'bg-amber-900 text-amber-300' : 'bg-red-900 text-red-300'}`}>
                                                {weatherData.harvestWindowLabel} for harvest
                                            </span>
                                        </div>

                                        {/* Current conditions */}
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {[
                                                { icon: <Thermometer className="h-3.5 w-3.5" />, label: 'Temp', value: `${weatherData.current.temp}°C` },
                                                { icon: <Droplets className="h-3.5 w-3.5" />, label: 'Humidity', value: `${weatherData.current.humidity}%` },
                                                { icon: <Wind className="h-3.5 w-3.5" />, label: 'Wind', value: `${weatherData.current.windSpeed} km/h` },
                                            ].map(item => (
                                                <div key={item.label} className="flex flex-col items-center rounded-lg border border-[#1a2d1a] bg-[#0d1a0d] p-2 gap-1">
                                                    <span className="text-zinc-500">{item.icon}</span>
                                                    <span className="text-white text-sm font-bold">{item.value}</span>
                                                    <span className="text-zinc-600 text-[10px]">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 5-day forecast */}
                                        <div className="space-y-1.5">
                                            {weatherData.forecast.slice(0, 5).map((day, i) => (
                                                <div key={i} className="flex items-center gap-2 rounded-lg bg-[#0d1a0d] px-3 py-2">
                                                    <span className="w-20 text-xs text-zinc-400 truncate">{day.dayLabel}</span>
                                                    <div className="flex-1">
                                                        <div className={`h-1.5 rounded-full ${day.harvestRisk === 'Low' ? 'bg-emerald-600' : day.harvestRisk === 'Medium' ? 'bg-amber-500' : 'bg-red-600'}`}
                                                            style={{ width: `${day.rain > 0 ? Math.min(100, day.rain * 5 + 30) : 20}%` }} />
                                                    </div>
                                                    <span className="text-xs text-zinc-400">{day.tempMax}°C</span>
                                                    <span className="text-xs text-sky-400 w-10 text-right">{day.rain > 0 ? `💧${day.rain}mm` : '☀️'}</span>
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${day.harvestRisk === 'Low' ? 'text-emerald-400' : day.harvestRisk === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
                                                        {day.harvestRisk}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-3 flex justify-between text-[10px] text-zinc-600">
                                            <span>🌧️ Rain days next 7: <strong className="text-zinc-400">{weatherData.rainDaysNext7}</strong></span>
                                            <span>💧 Avg humidity: <strong className="text-zinc-400">{weatherData.avgHumidityNext7}%</strong></span>
                                        </div>
                                    </div>
                                )}

                                {/* Soil Health Card */}
                                {soilData && (
                                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Leaf className="h-4 w-4 text-emerald-400" />
                                            <h3 className="font-bold text-white text-sm">Soil Health Profile</h3>
                                            <span className="ml-auto text-xs text-zinc-500">ICAR Data</span>
                                        </div>

                                        {/* Health score donut */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative shrink-0">
                                                {(() => {
                                                    const r = 32, c = 2 * Math.PI * r;
                                                    const color = soilData.healthScore >= 70 ? '#22c55e' : soilData.healthScore >= 50 ? '#f59e0b' : '#ef4444';
                                                    return (
                                                        <svg width="80" height="80" viewBox="0 0 80 80">
                                                            <circle cx="40" cy="40" r={r} fill="none" stroke="#1a2d1a" strokeWidth="10" />
                                                            <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="10"
                                                                strokeDasharray={c} strokeDashoffset={c - (soilData.healthScore / 100) * c}
                                                                strokeLinecap="round" transform="rotate(-90 40 40)"
                                                                style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                                            <text x="40" y="37" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">{soilData.healthScore}</text>
                                                            <text x="40" y="50" textAnchor="middle" fill="#71717a" fontSize="8">/100</text>
                                                        </svg>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-1 space-y-2 text-xs">
                                                {[
                                                    { label: 'Soil Type', value: soilData.soilType },
                                                    { label: 'pH', value: `${soilData.pH} (${soilData.phStatus})` },
                                                    { label: 'Organic Matter', value: soilData.organicMatter },
                                                    { label: 'Drainage', value: soilData.drainage },
                                                    { label: `${crop} Suitability`, value: soilData.cropSuitability, highlight: true },
                                                ].map(row => (
                                                    <div key={row.label} className="flex justify-between">
                                                        <span className="text-zinc-500">{row.label}</span>
                                                        <span className={row.highlight
                                                            ? soilData.cropSuitability === 'Excellent' ? 'font-bold text-emerald-400'
                                                                : soilData.cropSuitability === 'Good' ? 'font-bold text-blue-400'
                                                                    : soilData.cropSuitability === 'Moderate' ? 'font-bold text-amber-400'
                                                                        : 'font-bold text-red-400'
                                                            : 'text-zinc-200'}>
                                                            {row.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {result.data.msp && (
                                            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-2.5 flex items-center justify-between">
                                                <span className="text-xs text-zinc-400">📜 Govt. MSP (Support Price)</span>
                                                <span className="text-sm font-bold text-emerald-400">
                                                    ₹{result.data.msp.msp} {result.data.msp.unit}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* BEST MANDI CARD */}
                            <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-amber-400" />
                                    <h3 className="font-bold text-white text-sm">Best Market Recommendation</h3>
                                    <span className="ml-auto text-xs text-zinc-500">Net Profit Ranked</span>
                                </div>

                                {mandis.length > 0 && (
                                    <>
                                        {/* Best mandi highlight */}
                                        <div className="mb-4 rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">🥇</span>
                                                <div className="flex-1">
                                                    <p className="font-bold text-white text-sm">{mandis[0].name}</p>
                                                    <p className="text-xs text-zinc-400 mt-0.5">{rec.bestMandiReason}</p>
                                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                                        {[
                                                            { label: 'Offered Price', value: `₹${mandis[0].avgPrice}/q` },
                                                            { label: 'Transport Cost', value: `-₹${mandis[0].transportCostPerQ}/q` },
                                                            { label: 'Net Profit', value: `₹${mandis[0].netProfit}/q` },
                                                        ].map(item => (
                                                            <div key={item.label} className="rounded-lg bg-black/30 p-2 text-center">
                                                                <p className="text-xs text-zinc-500">{item.label}</p>
                                                                <p className={`text-sm font-bold ${item.label === 'Net Profit' ? 'text-emerald-400' : item.label === 'Transport Cost' ? 'text-red-400' : 'text-white'}`}>
                                                                    {item.value}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* All mandis comparison */}
                                        <div className="space-y-2">
                                            {mandis.slice(1).map((m, i) => (
                                                <div key={m.name} className="flex items-center gap-3 rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 py-2.5">
                                                    <span className="text-base">{['🥈', '🥉', '🔵'][i]}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-zinc-200 truncate">{m.name}</p>
                                                        <p className="text-[10px] text-zinc-500">📍 {m.distance}km · Transport ₹{m.transportCostPerQ}/q</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-bold text-emerald-400">₹{m.avgPrice}/q</p>
                                                        <p className="text-[10px] text-zinc-500">Net: ₹{m.netProfit}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* PRICE TREND CHART */}
                            {priceData && priceData.trend12m.length > 0 && (
                                <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                                    <div className="mb-4 flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                                                <h3 className="font-bold text-white text-sm">12-Month Price Trend — {priceData.commodity}</h3>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-0.5">{priceData.insight}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${priceData.direction === 'Rising' ? 'bg-emerald-900 text-emerald-300' : priceData.direction === 'Falling' ? 'bg-red-900 text-red-300' : 'bg-zinc-800 text-zinc-300'}`}>
                                            {priceData.direction === 'Rising' ? '↑' : priceData.direction === 'Falling' ? '↓' : '→'} {priceData.change > 0 ? '+' : ''}{priceData.change}%
                                        </span>
                                    </div>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={priceData.trend12m} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0a160a', border: '1px solid #1a2d1a', borderRadius: 8, fontSize: 11 }}
                                                    labelStyle={{ color: '#a1a1aa' }}
                                                    itemStyle={{ color: '#34d399' }}
                                                />
                                                <Bar dataKey="index" radius={[3, 3, 0, 0]}>
                                                    {priceData.trend12m.map((_, i) => (
                                                        <Cell
                                                            key={i}
                                                            fill={i === priceData.trend12m.length - 1 ? '#10b981' : '#1a3a1a'}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                                        <span>Peak month: <strong className="text-zinc-400">{priceData.peakMonth}</strong></span>
                                        <span>Seasonal score: <strong className="text-zinc-400">{priceData.seasonalScore}/100</strong></span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Empty State ─────────────────────────────────────────────── */}
                    {!result && !loading && !error && (
                        <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-10 text-center">
                            <div className="text-5xl mb-3">🌾</div>
                            <h3 className="font-bold text-white text-base mb-1">AI Harvest Advisor</h3>
                            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                                Select your crop and location above, then click <strong className="text-zinc-300">"Get AI Harvest Advice"</strong>. The AI will analyze live weather, your soil type, and market prices to tell you exactly when and where to sell.
                            </p>
                            <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
                                {['🌡️ Live Weather', '🌱 Soil Data', '📈 Price Trends'].map(f => (
                                    <div key={f} className="rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-2 py-3">
                                        <p className="text-xs text-zinc-400">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
