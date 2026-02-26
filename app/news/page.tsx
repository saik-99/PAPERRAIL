'use client'

import { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface Article {
    title_en: string;
    title_hi: string;
    description_en: string;
    description_hi: string;
    link: string;
    published_at: string;
    source: { name: string };
    image_url?: string;
}

export default function NewsPage() {
    const { language } = useLanguage();
    const [news, setNews] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNews = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/news');
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch news');

            setNews(data.articles || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

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
                <TopBar meta={{ greeting: 'Daily Updates', title: 'Agri News' }} />

                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-5xl space-y-6">

                        <div className="flex items-center justify-between rounded-xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-900/40 rounded-lg shrink-0">
                                    <Newspaper className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">Top Farming News</h2>
                                    <p className="text-xs text-zinc-400">Live updates powered by APITube</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchNews}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg border border-[#1a2d1a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a2d1a] transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-500' : 'text-zinc-400'}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-5 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-amber-500 mb-1">Could not fetch live news</h3>
                                    <p className="text-sm text-amber-200/70">{error}</p>
                                </div>
                            </div>
                        )}

                        {!loading && news.length === 0 && !error && (
                            <div className="text-center py-20 rounded-xl border border-dashed border-[#1a2d1a]">
                                <Newspaper className="mx-auto h-12 w-12 text-zinc-800 mb-4" />
                                <p className="text-zinc-500 font-medium">No recent news available.</p>
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            {news.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col rounded-2xl border border-[#1a2d1a] bg-[#0a160a] overflow-hidden hover:border-emerald-800 transition-colors"
                                >
                                    {item.image_url && (
                                        <div className="h-48 w-full overflow-hidden border-b border-[#1a2d1a]">
                                            <img
                                                src={item.image_url}
                                                alt={language === 'hi' ? item.title_hi : item.title_en}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="inline-flex items-center rounded bg-[#1a2d1a] px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                                                {item.source?.name || 'News'}
                                            </span>
                                            <div className="flex items-center text-[10px] text-zinc-500 gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(item.published_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <h3 className="text-base font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {language === 'hi' ? item.title_hi : item.title_en}
                                        </h3>

                                        <p className="text-xs text-zinc-400 leading-relaxed max-w-none line-clamp-3 mb-4 flex-1">
                                            {language === 'hi' ? item.description_hi : item.description_en}
                                        </p>

                                        <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                                            {language === 'hi' ? 'पूरी खबर पढ़ें' : 'Read full story'} <ExternalLink className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
