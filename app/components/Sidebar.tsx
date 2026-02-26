'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Sprout, TrendingUp, MapPin, PackageOpen,
    Landmark, Mic, AlertTriangle, Leaf
} from 'lucide-react';

const NAV = [
    { label: 'OVERVIEW', items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        label: 'FEATURES',
        items: [
            { href: '/crop-ai', label: 'Crop AI', icon: Sprout },
            { href: '/analytics', label: 'Market Trends', icon: TrendingUp },
            { href: '/mandi-map', label: 'Mandi Finder', icon: MapPin },
            { href: '/spoilage', label: 'Spoilage & Storage', icon: PackageOpen },
        ],
    },
    {
        label: 'MORE',
        items: [
            { href: '/pm-schemes', label: 'Gov Schemes', icon: Landmark },
            { href: '/voice-ai', label: 'Voice AI', icon: Mic },
            { href: '/risk-alerts', label: 'Risk Alerts', icon: AlertTriangle },
        ],
    },
];

interface SidebarUser {
    email?: string | null;
    user_metadata?: { full_name?: string; avatar_url?: string };
}

export function Sidebar() {
    const pathname = usePathname();
    const { language, setLanguage } = useLanguage();
    const supabase = createClient();
    const [user, setUser] = useState<SidebarUser | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });
        return () => sub.subscription.unsubscribe();
    }, [supabase.auth]);

    const displayName = user?.user_metadata?.full_name?.split(' ')[0] ??
        user?.email?.split('@')[0] ?? 'Kisan';
    const initials = displayName.slice(0, 2).toUpperCase();
    const riskCount = 3; // mock badge count

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[168px] flex-col border-r border-[#1a2d1a] bg-[#050e05]">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-5">
                <Leaf className="h-6 w-6 text-emerald-500" />
                <span className="text-base font-bold text-white tracking-wide">KhetiWala</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
                {NAV.map((group) => (
                    <div key={group.label} className="mb-4">
                        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                            {group.label}
                        </p>
                        {group.items.map((item) => {
                            const active = pathname === item.href;
                            const isAlert = item.href === '/risk-alerts';
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                                        ? 'bg-emerald-900/50 text-emerald-400'
                                        : 'text-zinc-400 hover:bg-[#0d1a0d] hover:text-emerald-300'
                                        }`}
                                >
                                    <item.icon className={`h-4 w-4 shrink-0 ${isAlert ? 'text-amber-400' : ''}`} />
                                    <span className={`flex-1 ${isAlert ? 'text-amber-400' : ''}`}>{item.label}</span>
                                    {isAlert && (
                                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                                            {riskCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User profile at bottom */}
            <div className="border-t border-[#1a2d1a] p-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">{displayName}</p>
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                            className="text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                            {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
