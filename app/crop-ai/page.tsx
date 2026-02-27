'use client'

import { useState, useEffect, useMemo } from 'react';
import { TopBar } from '../components/TopBar';
import { Brain, TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function PricePredictorPage() {
    const { t } = useLanguage();
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
        <div className="flex flex-col min-h-screen relative bg-[#f4f7f4]">
            {/* Background Image with Light Overlay */}
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
                <TopBar meta={{ greeting: 'AI Market Intelligence', title: t('interactive_predictor') }} />
                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-4xl space-y-6">

                        {/* Header */}
                        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
                            <div className="relative z-10">
                                <Brain className="mx-auto h-10 w-10 text-emerald-600 mb-3" />
                                <h2 className="text-xl font-bold text-zinc-900 mb-2">{t('ml_price_predictor')}</h2>
                                <p className="text-sm text-zinc-600 max-w-xl mx-auto">
                                    {t('ml_desc')}
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center p-10"><RefreshCw className="animate-spin text-emerald-600 w-8 h-8" /></div>
                        ) : mlData ? (
                            <div className="grid md:grid-cols-2 gap-6">

                                {/* Input Form */}
                                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow">
                                    <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">{t('sim_variables')}</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-600 mb-1.5">{t('select_commodity')}</label>
                                            <select
                                                value={selectedCrop}
                                                onChange={handleCropChange}
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
                                            >
                                                {Object.keys(mlData).map(key => (
                                                    <option key={key} value={key}>{mlData[key].name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {mlModel ? (
                                            <div>
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <label className="block text-xs font-bold text-zinc-600">{t('expected_arrival')}</label>
                                                    <span className="text-[10px] font-semibold text-zinc-500">{t('last')}: {mlModel.lastArrival.toFixed(2)}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={arrivalVolume}
                                                    onChange={(e) => setArrivalVolume(e.target.value === '' ? '' : Number(e.target.value))}
                                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-lg font-mono text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner min-h-[50px]"
                                                />
                                                <div className="mt-2 text-[10px] font-medium text-zinc-500 flex items-start gap-1">
                                                    <Activity className="w-3 h-3 shrink-0 mt-0.5" />
                                                    <p>{t('adjust_volume_tip')}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                                                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                                <p className="text-xs font-semibold text-red-700">{t('insufficient_data')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Output Result */}
                                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 relative overflow-hidden flex flex-col justify-center hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>

                                    <h3 className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider relative z-10">{t('predicted_output')}</h3>

                                    {mlModel && predictionResult ? (
                                        <div className="relative z-10">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-5xl font-black text-emerald-800">₹{predictionResult.price.toFixed(0)}</span>
                                                <span className="text-sm font-bold text-zinc-500">{t('per_quintal')}</span>
                                            </div>

                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${predictionResult.isRising ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                {predictionResult.isRising ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                ₹{Math.abs(predictionResult.change).toFixed(0)} ({Math.abs(predictionResult.percentChange).toFixed(1)}%)
                                            </div>

                                            <div className="mt-8 border-t border-zinc-100 pt-4">
                                                <p className="text-xs text-emerald-600 font-bold mb-1">{t('model_logic')}</p>
                                                <p className="text-[11px] font-bold text-zinc-600 leading-relaxed font-mono">
                                                    {t('price_eq')} ({predictionResult.isRising ? '+' : ''}{mlModel.coefficient.toFixed(4)} × {arrivalVolume}) + {mlModel.intercept.toFixed(2)}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-2 font-medium italic relative z-10">
                                                    {t('ml_note')}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-zinc-500 py-10">
                                            {t('data_unavailable')}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 py-20">{t('failed_market_data')}</div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
