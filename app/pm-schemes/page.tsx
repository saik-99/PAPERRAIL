'use client'

import { TopBar } from '../components/TopBar';
import { ExternalLink } from 'lucide-react';

const SCHEMES = [
    { icon: '🌾', category: 'Insurance', title: 'PM Fasal Bima Yojana', desc: 'Crop insurance against natural calamities. Premium as low as 1.5% of sum insured.', link: 'https://pmfby.gov.in/' },
    { icon: '💰', category: 'Income', title: 'PM-KISAN Samman Nidhi', desc: '₹6,000/year direct income support in 3 installments to all eligible farmers.', link: 'https://pmkisan.gov.in/' },
    { icon: '🏦', category: 'Credit', title: 'Kisan Credit Card (KCC)', desc: 'Low-interest crop loan up to ₹3 lakh at 4% p.a. for production credit needs.', link: 'https://www.nabard.org/' },
    { icon: '📊', category: 'Market', title: 'eNAM Digital Market', desc: 'Online mandi platform. 1000+ mandis. Direct access to buyers across India.', link: 'https://www.enam.gov.in/' },
    { icon: '💧', category: 'Irrigation', title: 'PM Krishi Sinchai Yojana', desc: 'Micro-irrigation subsidy. 55% for small/marginal farmers, 45% for others.', link: 'https://pmksy.gov.in/' },
    { icon: '🌱', category: 'Soil', title: 'Soil Health Card Scheme', desc: 'Free soil testing every 2 years. Nutrient-specific fertilizer recommendations.', link: 'https://soilhealth.dac.gov.in/' },
];

const CATEGORY_COLORS: Record<string, string> = {
    Insurance: 'text-sky-400 bg-sky-900/20',
    Income: 'text-amber-400 bg-amber-900/20',
    Credit: 'text-purple-400 bg-purple-900/20',
    Market: 'text-emerald-400 bg-emerald-900/20',
    Irrigation: 'text-cyan-400 bg-cyan-900/20',
    Soil: 'text-lime-400 bg-lime-900/20',
};

export default function PMSchemesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <TopBar meta={{ greeting: 'Good afternoon', title: 'Government Scheme Matcher' }} />
            <main className="flex-1 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6 rounded-xl border border-[#1a2d1a] bg-[#0a160a] p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🏛️</span>
                            <div>
                                <h2 className="font-bold text-white">Government Scheme Matcher — All States</h2>
                                <p className="text-xs text-zinc-400">{SCHEMES.length} schemes matched to your crop and region</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {SCHEMES.map((scheme) => (
                            <div
                                key={scheme.title}
                                className="flex flex-col rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5 hover:border-emerald-800 transition-colors"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <span className="text-2xl">{scheme.icon}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CATEGORY_COLORS[scheme.category]}`}>
                                        {scheme.category}
                                    </span>
                                </div>
                                <h3 className="mb-2 text-sm font-bold text-white">{scheme.title}</h3>
                                <p className="mb-4 flex-1 text-xs leading-relaxed text-zinc-400">{scheme.desc}</p>
                                <a
                                    href={scheme.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    Apply Now <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
