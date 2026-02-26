'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Search, LogOut, ChevronDown, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useRouter } from 'next/navigation';

interface PageMeta {
    greeting: string;
    title: string;
}

interface TopBarProps {
    meta?: PageMeta;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export function TopBar({ meta }: TopBarProps) {
    const supabase = createClient();
    const router = useRouter();
    const { language, setLanguage } = useLanguage();
    const [displayName, setDisplayName] = useState('Kisan');
    const [email, setEmail] = useState('');
    const [initials, setInitials] = useState('KI');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const name = data.user?.user_metadata?.full_name?.split(' ')[0] ??
                data.user?.email?.split('@')[0] ?? 'Kisan';
            setDisplayName(name);
            setInitials(name.slice(0, 2).toUpperCase());
            setEmail(data.user?.email ?? '');
        });
    }, [supabase.auth]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const signOut = async () => {
        setDropdownOpen(false);
        await supabase.auth.signOut();
        router.push('/login');
    };

    const greeting = (meta?.greeting || '') !== '' ? meta!.greeting : getGreeting();
    const pageTitle = meta?.title ?? 'Dashboard';

    return (
        <div className="relative z-30 flex items-center justify-between border-b border-[#1a2d1a] bg-[#050e05] px-6 py-3">
            {/* Left: greeting + page title */}
            <div>
                <p className="text-xs text-zinc-400">
                    {greeting}, <span className="font-semibold text-white">{displayName}</span>{' '}
                    {['🌾', '🌻', '🌿', '🌱'][new Date().getDay() % 4]}
                </p>
                <h1 className="text-base font-bold text-emerald-400">{pageTitle}</h1>
            </div>

            {/* Center: Search bar */}
            <div className="mx-6 flex max-w-xs flex-1 items-center gap-2 rounded-full border border-[#1a2d1a] bg-[#0a160a] px-3 py-1.5 text-sm text-zinc-500">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span>Ask anything...</span>
            </div>

            {/* Right: Language + Bell + Avatar dropdown */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                    className="rounded-full border border-[#1a2d1a] bg-[#0d1a0d] px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors"
                >
                    {language === 'en' ? 'A/अ' : 'A/R'}
                </button>

                <button className="relative rounded-full border border-[#1a2d1a] bg-[#0d1a0d] p-1.5 text-zinc-400 hover:text-white">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">3</span>
                </button>

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(o => !o)}
                        className="flex items-center gap-1.5 rounded-full border border-[#1a2d1a] bg-[#0d1a0d] pl-1 pr-2 py-1 hover:border-emerald-600 transition-colors"
                        title="User menu"
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                            {initials}
                        </span>
                        <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#1a2d1a] bg-[#0a160a] shadow-2xl overflow-hidden z-50">
                            {/* User info header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2d1a]">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                                    {email && <p className="text-[10px] text-zinc-500 truncate">{email}</p>}
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="p-1">
                                <button
                                    onClick={() => { setDropdownOpen(false); router.push('/'); }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-[#0d1a0d] hover:text-white transition-colors"
                                >
                                    <User className="h-4 w-4 text-zinc-500" />
                                    My Profile
                                </button>

                                <div className="my-1 border-t border-[#1a2d1a]" />

                                <button
                                    onClick={signOut}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
