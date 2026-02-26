'use client'

import { TopBar } from '../components/TopBar';
import { AlertTriangle, Share2, X } from 'lucide-react';
import { useState } from 'react';

const ALERTS = [
    {
        id: 1,
        title: 'Heavy Rainfall Warning — 72hrs',
        desc: 'IMD Alert: 45mm rain expected in next 72 hours. Secure harvested crops immediately. Do NOT transport perishables. Store in waterproof cover.',
        icon: '🌧️',
        color: 'border-red-900/40 bg-red-950/20',
    },
    {
        id: 2,
        title: 'Pest Risk: Fall Armyworm Detected',
        desc: '3 farms in your district reported armyworm. Inspect crop undersides. Apply Chlorpyrifos 20EC if >5% leaf damage found.',
        icon: '🐛',
        color: 'border-amber-900/40 bg-amber-950/20',
    },
    {
        id: 3,
        title: 'Price Drop Alert: Wheat -8% in 48hrs',
        desc: 'Khanna Mandi wheat prices fell ₹340/qtl. Consider alternate mandis — Amritsar showing +₹410 premium. Wait 5 days for recovery.',
        icon: '📉',
        color: 'border-orange-900/40 bg-orange-950/20',
    },
    {
        id: 4,
        title: 'Heat Wave Alert: 38°C Forecasted',
        desc: 'Post-harvest grain in open storage at risk. Cover with tarpaulin immediately. Move to shade storage within 24hrs.',
        icon: '🌡️',
        color: 'border-red-900/40 bg-amber-950/20',
    },
];

export default function RiskAlertsPage() {
    const [dismissed, setDismissed] = useState<number[]>([]);
    const visible = ALERTS.filter(a => !dismissed.includes(a.id));

    return (
        <div className="flex flex-col min-h-screen">
            <TopBar meta={{ greeting: 'Good afternoon', title: 'Risk Alert Centre' }} />
            <main className="flex-1 p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 rounded-xl border border-[#1a2d1a] bg-[#0a160a] p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                            <div>
                                <h2 className="font-bold text-white">Risk Alert Center</h2>
                                <p className="text-xs text-zinc-400">Real-time alerts for weather, pests, and price drops</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {visible.map((alert) => (
                            <div
                                key={alert.id}
                                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${alert.color}`}
                            >
                                <span className="text-2xl">{alert.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm">{alert.title}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{alert.desc}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#0d1a0d] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors">
                                        <Share2 className="h-3 w-3" /> Share SMS
                                    </button>
                                    <button
                                        onClick={() => setDismissed(p => [...p, alert.id])}
                                        className="rounded-lg p-1.5 text-zinc-600 hover:text-zinc-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {visible.length === 0 && (
                            <div className="rounded-xl border border-[#1a2d1a] bg-[#0a160a] p-12 text-center">
                                <AlertTriangle className="mx-auto h-10 w-10 text-emerald-700 mb-3" />
                                <p className="text-zinc-400">All clear! No active alerts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
