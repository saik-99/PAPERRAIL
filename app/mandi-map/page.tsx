'use client'

import { useState, useEffect } from "react";
import { TopBar } from '../components/TopBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, TrendingUp } from "lucide-react";

const MANDIS = [
    { name: 'Khanna Grain Market (APMC)', dist: 35, transport: 210, offered: 5355, min: 5266, max: 5415 },
    { name: 'Ludhiana Veg Market', dist: 12, transport: 72, offered: 5212, min: 5068, max: 5386 },
    { name: 'Jalandhar Grain Hub', dist: 64, transport: 264, offered: 5315, min: 5253, max: 5383 },
    { name: 'Amritsar Central Mandi', dist: 58, transport: 348, offered: 5223, min: 5087, max: 5312 },
];

const MANDI_TIPS = [
    'Sell on Tuesday & Wednesday — historically 8-12% better prices',
    'Arrive at mandi before 9 AM for better queue priority',
    'Register on eNAM for direct online bidding — no broker fee',
    'Form FPO (Farmer Producer Org) to negotiate bulk prices',
];

const STATE_MAP: Record<string, string> = {
    maharashtra: 'MAHARASHTRA', punjab: 'PUNJAB', up: 'UTTAR PRADESH',
    mp: 'MADHYA PRADESH', gujarat: 'GUJARAT',
};

export default function MandiMapPage() {
    const [selectedState, setSelectedState] = useState('MAHARASHTRA');
    const [cropData, setCropData] = useState<{ Crop: string; Production: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState('');
    const [crop, setCrop] = useState('Wheat');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/crop-production?state=${selectedState}`)
            .then(r => r.json())
            .then(d => setCropData(d.top_crops_for_state ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedState]);

    const sorted = [...MANDIS].sort((a, b) => (b.offered - b.transport) - (a.offered - a.transport));

    return (
        <div className="flex flex-col min-h-screen">
            <TopBar meta={{ greeting: 'Good afternoon', title: 'Smart Mandi Finder' }} />
            <main className="flex-1 p-6 space-y-6">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Mandi Profit Optimizer */}
                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-lg">📍</span>
                            <h2 className="font-bold text-white">Smart Mandi Profit Optimizer</h2>
                        </div>
                        <p className="mb-1 text-xs text-zinc-500">
                            Ranked by <span className="font-semibold text-zinc-300">Net Profit = Offered Price − Transport Cost</span>. Not just the highest price.
                        </p>
                        <p className="mb-5 text-[10px] text-amber-400">Data: MOCK · Mock fallback · Updated: now</p>

                        <div className="space-y-2">
                            {sorted.map((m, i) => {
                                const net = m.offered - m.transport;
                                return (
                                    <div key={m.name} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${i === 0 ? 'border-emerald-800 bg-emerald-950/20' : 'border-[#1a2d1a] bg-[#0d1a0d]'}`}>
                                        <span className="text-lg">{['🥇', '🥈', '🥉', '🔵'][i]}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{m.name}</p>
                                            <p className="text-[11px] text-zinc-500">
                                                📍 {m.dist}km · Transport ₹{m.transport}/q · Min ₹{m.min} / Max ₹{m.max}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-base font-bold text-emerald-400">₹{m.offered}/q</p>
                                            <p className="text-[10px] text-zinc-500">Net: Offered ₹{net}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Distance Calculator + Mandi Tips */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <span>📐</span>
                                <h2 className="font-bold text-white">Distance Calculator</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Your Location</p>
                                    <input
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="Your village or PIN..."
                                        className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                                <div>
                                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Crop to Sell</p>
                                    <select
                                        value={crop}
                                        onChange={e => setCrop(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    >
                                        {['Wheat', 'Rice', 'Onion', 'Cotton', 'Tomato', 'Soyabean'].map(c => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="mt-2 h-10 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                                    Recalculate →
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <span>💡</span>
                                <h2 className="font-bold text-white">Mandi Tips</h2>
                            </div>
                            <ul className="space-y-2.5">
                                {MANDI_TIPS.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                                        <span className="mt-0.5 shrink-0 text-amber-400">💡</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
