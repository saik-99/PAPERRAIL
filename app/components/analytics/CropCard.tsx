'use client';

import { useState, useEffect } from 'react';
import { PriceChart } from './PriceChart';
import { TrendingUp, TrendingDown, Activity, Bot } from 'lucide-react';
import { translations, Language } from '../../analytics/translations';

interface CropCardProps {
    name: string;
    uiName: string; // The translated name
    language: Language;
}

export function CropCard({ name, uiName, language }: CropCardProps) {
    const t = translations[language];
    const [duration, setDuration] = useState<'7D' | '14D' | '1M'>('7D');
    const [mounted, setMounted] = useState(false);
    const [aiData, setAiData] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        // Load the generated AI predictions JSON
        fetch('/data/ml_price_predictions.json')
            .then(res => res.json())
            .then(data => {
                const normalizedName = name.toLowerCase();
                if (data[normalizedName]) {
                    setAiData(data[normalizedName]);
                }
            })
            .catch(err => console.error("Failed to load ML predictions", err));
    }, [name]);

    if (!mounted) {
        return <div className="h-72 w-full rounded-2xl border border-[#1a2d1a] bg-[#112311]/50 animate-pulse"></div>;
    }

    if (!aiData) {
        return (
            <div className="rounded-2xl border border-dashed border-[#1a2d1a] bg-[#0a160a] p-5 flex flex-col items-center justify-center h-full min-h-[16rem]">
                <span className="text-zinc-600 text-sm">No recent data for {uiName}</span>
            </div>
        );
    }

    // We generated 3 days of historical data via script, fallback missing points to first point
    const currentData = aiData.history || [];
    if (currentData.length === 0) {
        currentData.push({ date: 'Today', price: aiData.currentPrice });
    }

    const startPrice = currentData[0]?.price || aiData.currentPrice;
    const endPrice = aiData.currentPrice;
    const priceChange = endPrice - startPrice;

    // Avoid division by zero
    const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

    // For mock display of duration toggles since Agmarknet only gave us 3 days of granular data
    const chartData = [...currentData, { date: 'Predicted', price: aiData.predictedPrice }];

    // Simple Demand logic for UI flair based on Kharif vs Rabi relative volumes if available
    const totalVolume = (aiData.seasonArrivals?.kharif || 0) + (aiData.seasonArrivals?.rabi || 0);
    const demandScore = totalVolume > 500000 ? 9 : (totalVolume > 100000 ? 7 : 5);

    return (
        <div className="rounded-2xl border border-[#1a2d1a] bg-gradient-to-b from-[#112311] to-[#0a160a] p-5 shadow-lg shadow-black/20 hover:border-[#2a4d2a] transition-colors duration-300">
            <div className="flex flex-col gap-4">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white capitalize">{uiName.toLowerCase()}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold text-white">₹{endPrice.toFixed(0)}</span>
                            {priceChange !== 0 && (
                                <span className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-full ${priceChange > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                    {priceChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(percentChange).toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center text-[10px] sm:text-xs font-medium text-emerald-500 bg-emerald-950 px-2 py-1 rounded-md border border-emerald-900 shadow-inner">
                            <Activity className="w-3 h-3 mr-1" />
                            {t.demandScore} {demandScore}/10
                        </div>
                    </div>
                </div>

                {/* AI Prediction Section */}
                <div className="bg-[#0f210f] border border-emerald-900/50 rounded-xl p-3 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                            <Bot className="w-4 h-4" />
                            <span className="text-xs font-semibold">{t.aiPrediction}</span>
                        </div>
                        <span className={`text-sm font-bold ${aiData.isRising ? 'text-emerald-400' : 'text-red-400'}`}>
                            ₹{aiData.predictedPrice.toFixed(0)}
                        </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                        "{aiData.justification}"
                    </p>
                </div>

                {/* Segmented Control (Visual only for now since we have limited data points) */}
                <div className="flex bg-[#0a160a] rounded-lg p-1 border border-[#1a2d1a] shadow-inner">
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

                {/* Price Chart */}
                <PriceChart data={chartData} isRising={aiData.isRising} />
            </div>
        </div>
    );
}
