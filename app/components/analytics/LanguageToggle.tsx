'use client';

import { Language } from '../../analytics/translations';

interface LanguageToggleProps {
    language: Language;
    onToggle: (lang: Language) => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
    return (
        <div className="flex items-center gap-1 rounded-full border border-[#1a2d1a] bg-[#0a160a] p-1 shadow-inner">
            <button
                onClick={() => onToggle('en')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${language === 'en' ? 'bg-emerald-700 text-white shadow-md' : 'text-zinc-400 hover:text-emerald-400'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => onToggle('hi')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${language === 'hi' ? 'bg-emerald-700 text-white shadow-md' : 'text-zinc-400 hover:text-emerald-400'
                    }`}
            >
                हि
            </button>
        </div>
    );
}
