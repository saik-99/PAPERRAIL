'use client'

import { TopBar } from '../components/TopBar';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { translations, Language } from './translations';
import { LanguageToggle } from '../components/analytics/LanguageToggle';
import { CropCard } from '../components/analytics/CropCard';

export default function AnalyticsPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[language];

  // Map English keys to UI names based on current language
  const allCrops = t.featuredKeys.map((key, index) => ({
    key,
    uiName: t.featured[index]
  }));

  const displayCrops = query
    ? allCrops.filter(c => c.key.toLowerCase().includes(query.toLowerCase()) || c.uiName.toLowerCase().includes(query.toLowerCase()))
    : allCrops;

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#050a05]">
        <TopBar meta={{ greeting: t.greeting, title: t.title }} />
        <main className="flex-1 p-4 md:p-6 mb-20">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050a05]">
      <TopBar meta={{ greeting: t.greeting, title: t.title }} />
      <main className="flex-1 p-4 md:p-6 mb-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white transition-colors">{t.title}</h1>
              <p className="text-sm text-zinc-400 mt-1">{t.lastUpdated}: {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'en-IN')}</p>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <LanguageToggle language={language} onToggle={setLanguage} />
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setQuery(input); }}
                placeholder={t.searchPlaceholder}
                className="h-12 w-full rounded-xl border border-[#1a2d1a] bg-[#0a160a] pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all shadow-inner"
              />
            </div>
            <button onClick={() => setQuery(input)}
              className="h-12 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors">
              {t.searchButton}
            </button>
          </div>

          {displayCrops.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              {t.noData}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayCrops.map(crop => (
                <CropCard
                  key={crop.key}
                  name={crop.key}
                  uiName={crop.uiName}
                  language={language}
                />
              ))}
            </div>
          )}

          <div className="mt-8 text-center border-t border-[#1a2d1a] pt-4">
            <p className="text-[10px] text-zinc-600">{t.source}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
