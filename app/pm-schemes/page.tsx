'use client'

import { TopBar } from '../components/TopBar';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

// Refactored to map keys to descriptions for i18n
const SCHEME_KEYS = [
    { icon: '🌾', catKey: 'insurance', titleKey: 'pmfby_title', descKey: 'pmfby_desc', link: 'https://pmfby.gov.in/' },
    { icon: '💰', catKey: 'income', titleKey: 'pmkisan_title', descKey: 'pmkisan_desc', link: 'https://pmkisan.gov.in/' },
    { icon: '🏦', catKey: 'credit', titleKey: 'kcc_title', descKey: 'kcc_desc', link: 'https://www.nabard.org/' },
    { icon: '📊', catKey: 'market', titleKey: 'enam_title', descKey: 'enam_desc', link: 'https://www.enam.gov.in/' },
    { icon: '💧', catKey: 'irrigation', titleKey: 'pmksy_title', descKey: 'pmksy_desc', link: 'https://pmksy.gov.in/' },
    { icon: '🌱', catKey: 'soil', titleKey: 'shc_title', descKey: 'shc_desc', link: 'https://soilhealth.dac.gov.in/' },
];

const CATEGORY_COLORS: Record<string, string> = {
    Insurance: 'text-sky-700 bg-sky-50',
    Income: 'text-amber-700 bg-amber-50',
    Credit: 'text-purple-700 bg-purple-50',
    Market: 'text-emerald-700 bg-emerald-50',
    Irrigation: 'text-cyan-700 bg-cyan-50',
    Soil: 'text-lime-700 bg-lime-50',
};

export default function PMSchemesPage() {
    const { t } = useLanguage();

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
                <TopBar meta={{ greeting: 'Good afternoon', title: t('gov_scheme_matcher') }} />
                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-6 rounded-xl border border-emerald-100 bg-white shadow-sm p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🏛️</span>
                                <div>
                                    <h2 className="font-bold text-zinc-900">{t('all_states')}</h2>
                                    <p className="text-xs text-zinc-500">{SCHEME_KEYS.length} {t('schemes_matched')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {SCHEME_KEYS.map((scheme) => (
                                <div
                                    key={scheme.titleKey}
                                    className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition-all"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <span className="text-2xl">{scheme.icon}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CATEGORY_COLORS[scheme.catKey] || 'text-emerald-700 bg-emerald-50'}`}>
                                            {t(scheme.catKey)}
                                        </span>
                                    </div>
                                    <h3 className="mb-2 text-sm font-bold text-zinc-900">{t(scheme.titleKey)}</h3>
                                    <p className="mb-4 flex-1 text-xs leading-relaxed text-zinc-600">{t(scheme.descKey)}</p>
                                    <a
                                        href={scheme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        {t('apply_now')} <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
