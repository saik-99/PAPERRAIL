'use client'

import { TopBar } from '../components/TopBar';
import { Sprout, Zap, Brain } from 'lucide-react';

const CROPS_ANALYSIS = [
    { crop: 'Wheat', health: 92, action: 'Harvest in 2 weeks', risk: 'Low', riskColor: 'text-emerald-400' },
    { crop: 'Rice', health: 78, action: 'Check for blast disease', risk: 'Medium', riskColor: 'text-amber-400' },
    { crop: 'Onion', health: 65, action: 'Reduce irrigation now', risk: 'Medium', riskColor: 'text-amber-400' },
    { crop: 'Cotton', health: 88, action: 'Monitor for bollworm', risk: 'Low', riskColor: 'text-emerald-400' },
];

export default function CropAIPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <TopBar meta={{ greeting: 'Good afternoon', title: 'Crop AI Advisor' }} />
            <main className="flex-1 p-6">
                <div className="mx-auto max-w-4xl space-y-6">

                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                        <div className="mb-1 flex items-center gap-2">
                            <Brain className="h-5 w-5 text-emerald-500" />
                            <h2 className="font-bold text-white">AI Crop Health Monitor</h2>
                        </div>
                        <p className="text-xs text-zinc-500 mb-5">ML-powered crop health analysis. Connect your farm sensors or provide soil data for personalized advice.</p>

                        <div className="space-y-3">
                            {CROPS_ANALYSIS.map(c => (
                                <div key={c.crop} className="flex items-center gap-4 rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-4 py-3">
                                    <Sprout className="h-5 w-5 shrink-0 text-emerald-600" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-white">{c.crop}</span>
                                            <span className={`text-[10px] font-bold uppercase ${c.riskColor}`}>{c.risk} Risk</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-[#1a2d1a] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                                                style={{ width: `${c.health}%`, backgroundColor: c.health > 85 ? '#16a34a' : c.health > 70 ? '#ca8a04' : '#dc2626' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-white">{c.health}%</p>
                                        <p className="text-[10px] text-zinc-500">Health</p>
                                    </div>
                                    <div className="hidden sm:block max-w-[180px]">
                                        <div className="flex items-center gap-1.5 rounded-lg bg-[#0a160a] px-2.5 py-1.5">
                                            <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                                            <p className="text-[11px] text-zinc-400">{c.action}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 text-center">
                        <Brain className="mx-auto h-8 w-8 text-emerald-600 mb-3" />
                        <p className="font-semibold text-white mb-1">Connect your Gemini AI for deeper analysis</p>
                        <p className="text-xs text-zinc-500 mb-4">Use the AI chat (bottom right) to ask about specific crops, diseases, or weather impact on your yield.</p>
                        <p className="text-[10px] text-emerald-600">Gemini API: Connected ✓</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
