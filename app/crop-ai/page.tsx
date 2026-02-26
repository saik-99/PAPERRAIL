'use client'

import { useState, useEffect, useMemo } from 'react';
import { TopBar } from '../components/TopBar';
import { Brain, TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw } from 'lucide-react';

export default function PricePredictorPage() {
    const [mlData, setMlData] = useState<any>(null);
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [arrivalVolume, setArrivalVolume] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/data/ml_price_predictions.json')
            .then(res => res.json())
            .then(data => {
                setMlData(data);
                const keys = Object.keys(data);
                if (keys.length > 0) {
                    setSelectedCrop(keys[0]);
                    setArrivalVolume(data[keys[0]]?.mlModel?.lastArrival || 1000);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load ML predictions", err);
                setIsLoading(false);
            });
    }, []);

    const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crop = e.target.value;
        setSelectedCrop(crop);
        const defaultArr = mlData?.[crop]?.mlModel?.lastArrival || 1000;
        setArrivalVolume(defaultArr);
    };

    const activeCropData = mlData?.[selectedCrop];
    const mlModel = activeCropData?.mlModel;

    // Calculate Dynamic Prediction
    const predictionResult = useMemo(() => {
        if (!mlModel || arrivalVolume === '') return null;

        const calcPrice = (Number(arrivalVolume) * mlModel.coefficient) + mlModel.intercept;

        // Boundaries (Max 25% variance from current price so it doesn't break logic completely on weird inputs)
        const currentPx = activeCropData.currentPrice;
        const boundedPrice = Math.max(currentPx * 0.75, Math.min(currentPx * 1.25, calcPrice));

        const change = boundedPrice - currentPx;

        return {
            price: boundedPrice,
            change: change,
            isRising: change > 0,
            percentChange: (change / currentPx) * 100
        };
    }, [mlModel, arrivalVolume, activeCropData]);

    return (
        <div className="flex flex-col min-h-screen relative bg-[#050a05]">
            {/* Background Image with Dark Overlay */}
            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2689&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050a05]/80 via-[#050a05]/95 to-[#050a05] pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <TopBar meta={{ greeting: 'AI Market Intelligence', title: 'Interactive Predictor' }} />
                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-4xl space-y-6">

                        {/* Header */}
                        <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#0a160a] to-[#052e16] p-6 text-center shadow-lg">
                            <Brain className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
                            <h2 className="text-xl font-bold text-white mb-2">Machine Learning Price Predictor</h2>
                            <p className="text-sm text-emerald-100/70 max-w-xl mx-auto">
                                Experiment with expected market arrival volumes to instantly see how supply impacts future prices based on our Linear Regression model trained on Agmarknet data.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center p-10"><RefreshCw className="animate-spin text-emerald-600 w-8 h-8" /></div>
                        ) : mlData ? (
                            <div className="grid md:grid-cols-2 gap-6">

                                {/* Input Form */}
                                <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-6">
                                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-zinc-400">Simulation Variables</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Select Commodity</label>
                                            <select
                                                value={selectedCrop}
                                                onChange={handleCropChange}
                                                className="w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                            >
                                                {Object.keys(mlData).map(key => (
                                                    <option key={key} value={key}>{mlData[key].name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {mlModel ? (
                                            <div>
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <label className="block text-xs font-medium text-zinc-400">Expected Arrival Volume (Tonnes)</label>
                                                    <span className="text-[10px] text-zinc-500">Last: {mlModel.lastArrival.toFixed(2)}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={arrivalVolume}
                                                    onChange={(e) => setArrivalVolume(e.target.value === '' ? '' : Number(e.target.value))}
                                                    className="w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-4 py-3 text-lg font-mono text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                />
                                                <div className="mt-2 text-[10px] text-zinc-500 flex items-start gap-1">
                                                    <Activity className="w-3 h-3 shrink-0 mt-0.5" />
                                                    <p>Adjust volume to simulate supply shocks. Higher volumes generally indicate lower prices.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-4 text-center">
                                                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                                <p className="text-xs text-red-200">Insufficient historical data points to construct a regression model for this crop.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Output Result */}
                                <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-6 relative overflow-hidden flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl"></div>

                                    <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider text-zinc-400">Predicted Price Output</h3>

                                    {mlModel && predictionResult ? (
                                        <>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-5xl font-extrabold text-white">₹{predictionResult.price.toFixed(0)}</span>
                                                <span className="text-sm text-zinc-400">/ Quintal</span>
                                            </div>

                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${predictionResult.isRising ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-red-950 text-red-400 border border-red-900/50'}`}>
                                                {predictionResult.isRising ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                ₹{Math.abs(predictionResult.change).toFixed(0)} ({Math.abs(predictionResult.percentChange).toFixed(1)}%)
                                            </div>

                                            <div className="mt-8 border-t border-[#1a2d1a] pt-4">
                                                <p className="text-xs text-emerald-500 font-semibold mb-1">Model Logic</p>
                                                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                                                    Price = ({predictionResult.isRising ? '+' : ''}{mlModel.coefficient.toFixed(4)} × {arrivalVolume}) + {mlModel.intercept.toFixed(2)}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-2 italic">
                                                    * Note: ML model constraints prevent variance &gt;25% from currently traded prices.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-zinc-500 py-10">
                                            Data unavailable for calculation.
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 py-20">Failed to load Market Data.</div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
