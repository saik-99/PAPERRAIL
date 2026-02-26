'use client';

import { useState, useMemo, useEffect } from 'react';
import { PriceChart } from './PriceChart';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { translations, Language } from '../../analytics/translations';

interface CropCardProps {
    name: string;
    uiName: string; // The translated name
    language: Language;
}

function pseudoRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Generate deterministic mock data based on seed
const generateMockData = (days: number, seedStr: string, volatility: number) => {
    let startSeed = Array.from(seedStr).reduce((acc, char) => acc + char.charCodeAt(0), 0) * 10;

    // Base price 1500 to 4500 roughly
    let currentPrice = 1500 + (pseudoRandom(startSeed) * 3000);

    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Simulate trend based on pseudoRandom
        const direction = pseudoRandom(startSeed++) > 0.45 ? 1 : -1;
        const change = direction * pseudoRandom(startSeed++) * volatility;
        currentPrice = Math.max(500, currentPrice + change);

        data.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            price: currentPrice
        });
    }
    return data;
};

export function CropCard({ name, uiName, language }: CropCardProps) {
    const t = translations[language];
    const [duration, setDuration] = useState<'7D' | '14D' | '1M'>('7D');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const dataMap = useMemo(() => {
        return {
            '7D': generateMockData(7, name + '7', 100),
            '14D': generateMockData(14, name + '14', 120),
            '1M': generateMockData(30, name + '1M', 150),
        };
    }, [name]);

    const currentData = dataMap[duration];
    const startPrice = currentData[0].price;
    const endPrice = currentData[currentData.length - 1].price;
    const priceChange = endPrice - startPrice;
    const percentChange = (priceChange / startPrice) * 100;
    const isRising = priceChange >= 0;

    // Deterministic Demand Score
    const demandSeed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const demandScore = Math.floor(5 + (pseudoRandom(demandSeed) * 5));

    if (!mounted) {
        return <div className="h-72 w-full rounded-2xl border border-[#1a2d1a] bg-[#112311]/50 animate-pulse"></div>;
    }

    return (
        <div className="rounded-2xl border border-[#1a2d1a] bg-gradient-to-b from-[#112311] to-[#0a160a] p-5 shadow-lg shadow-black/20 hover:border-[#2a4d2a] transition-colors duration-300">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className="text-xl font-bold text-white capitalize">{uiName.toLowerCase()}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">₹{endPrice.toFixed(0)}</span>
                        <span className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ${isRising ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                            {isRising ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {Math.abs(percentChange).toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center text-[10px] sm:text-xs font-medium text-emerald-500 bg-emerald-950 px-2 py-1 rounded-md border border-emerald-900 shadow-inner">
                        <Activity className="w-3 h-3 mr-1" />
                        {t.demandScore} {demandScore}/10
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-2">
                        {t.priceTrend}: {isRising ? <span className="text-emerald-400">{t.rising}</span> : <span className="text-red-400">{t.falling}</span>}
                    </span>
                </div>
            </div>

            {/* Segmented Control */}
            <div className="flex bg-[#0a160a] rounded-lg p-1 mt-4 border border-[#1a2d1a] shadow-inner">
                {[
                    { key: '7D', label: t.duration7D },
                    { key: '14D', label: t.duration14D },
                    { key: '1M', label: t.duration1M }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setDuration(tab.key as any)}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all duration-300 ${duration === tab.key
                                ? 'bg-[#1a2d1a] text-emerald-400 shadow-sm border border-[#2a4d2a]'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#112311]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <PriceChart data={currentData} isRising={isRising} />
        </div>
    );
}
