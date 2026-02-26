'use client'

import { useLanguage } from "../components/LanguageContext";
import { CloudSun, CloudRain, Thermometer, Wind, Droplets } from "lucide-react";

export default function WeatherPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 lg:px-20">
                <section className="mb-10 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 sm:text-4xl">
                        {t('local_weather')}
                    </h1>
                    <p className="text-base text-zinc-600 dark:text-zinc-400">
                        Localized forecasts and alerts for smarter farm management.
                    </p>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="col-span-1 lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="text-5xl font-bold mb-1">32°C</div>
                                <div className="text-zinc-500 font-medium">Clear Sky • Indore, MP</div>
                            </div>
                            <CloudSun className="h-20 w-20 text-amber-500" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="text-center">
                                <Thermometer className="mx-auto h-5 w-5 text-zinc-400 mb-2" />
                                <div className="text-sm font-semibold">34° / 22°</div>
                                <div className="text-[10px] text-zinc-500 uppercase">Temp</div>
                            </div>
                            <div className="text-center">
                                <Droplets className="mx-auto h-5 w-5 text-sky-400 mb-2" />
                                <div className="text-sm font-semibold">45%</div>
                                <div className="text-[10px] text-zinc-500 uppercase">Humidity</div>
                            </div>
                            <div className="text-center">
                                <Wind className="mx-auto h-5 w-5 text-emerald-400 mb-2" />
                                <div className="text-sm font-semibold">12 km/h</div>
                                <div className="text-[10px] text-zinc-500 uppercase">Wind</div>
                            </div>
                            <div className="text-center">
                                <CloudRain className="mx-auto h-5 w-5 text-blue-400 mb-2" />
                                <div className="text-sm font-semibold">5%</div>
                                <div className="text-[10px] text-zinc-500 uppercase">Rain</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-950/20">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">Advisory Alert</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Ideal harvesting conditions for Wheat expected over the next 48 hours. No rain predicted.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
