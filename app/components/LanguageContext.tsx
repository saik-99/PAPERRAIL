'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

// Basic Dictionary for Demo MVP
const dictionary: Record<string, Record<Language, string>> = {
    // Common
    'kisan_dashboard': { en: 'Kisan Dashboard', hi: 'किसान डैशबोर्ड' },
    'dashboard_sub': { en: 'Smart crop planning, real-time APMC mandi prices, and weather intelligence for your farm.', hi: 'आपके खेत के लिए स्मार्ट फसल योजना, रीयल-टाइम APMC मंडी कीमतें, और मौसम की जानकारी।' },

    // Farm Profile Form
    'your_farm_profile': { en: 'Your Farm Profile', hi: 'आपका खेत प्रोफ़ाइल' },
    'state_region': { en: 'State / Region', hi: 'राज्य / क्षेत्र' },
    'select_state': { en: 'Select State', hi: 'राज्य चुनें' },
    'nearest_city': { en: 'Nearest City / Mandi', hi: 'निकटतम शहर / मंडी' },
    'land_size': { en: 'Land Size (Acres)', hi: 'भूमि का आकार (एकड़)' },
    'crop_focus': { en: 'Crop Focus', hi: 'मुख्य फसल' },
    'select_crop': { en: 'Select Crop', hi: 'फसल चुनें' },
    'analyze_insights': { en: 'Analyze AI Insights for My Profile', hi: 'मेरे प्रोफ़ाइल के लिए एआई विश्लेषण प्राप्त करें' },

    // Weather
    'local_weather': { en: 'Local Weather', hi: 'स्थानीय मौसम' },
    'humidity': { en: 'Humidity', hi: 'नमी' },
    'wind': { en: 'Wind', hi: 'हवा' },

    // Intelligence
    'market_intelligence': { en: 'Market Intelligence & Schemes', hi: 'बाजार की जानकारी और योजनाएं' },
    'ai_price_predictor': { en: 'AI Price Predictor (Gemini/ML)', hi: 'एआई मूल्य अनुमानक (Gemini/ML)' },
    'nearest_mandis': { en: 'Nearest APMC Mandis', hi: 'निकटतम एपीएमसी मंडियां' },
    'gov_schemes': { en: 'Gov. Yojanas & Schemes', hi: 'सरकारी योजनाएं' },
    'new': { en: 'New', hi: 'नया' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    // Load from localStorage safely (can fail under strict browser security / iframes)
    useEffect(() => {
        try {
            const saved = localStorage.getItem('khetiwala_lang') as Language;
            if (saved && (saved === 'en' || saved === 'hi')) {
                setLanguage(saved);
            }
        } catch {
            // localStorage blocked — default to 'en', no crash
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        try {
            localStorage.setItem('khetiwala_lang', lang);
        } catch {
            // localStorage blocked — state still works in-memory
        }
    };

    const t = (key: string): string => {
        return dictionary[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
