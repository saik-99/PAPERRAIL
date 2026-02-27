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

    // Dashboard specific Additions
    'eg_nagpur': { en: 'e.g. Nagpur', hi: 'उदा. नागपुर' },
    'eg_5': { en: 'e.g. 5', hi: 'उदा. 5' },
    'wpi_price_index': { en: 'WPI Price Index · India 2011–2017', hi: 'WPI मूल्य सूचकांक · भारत 2011–2017' },
    'smart_harvest_ai': { en: 'Smart Harvest AI', hi: 'स्मार्ट फसल एआई' },
    'optimal_window_target': { en: 'Optimal Window & Target Market', hi: 'सही समय और लक्ष्य बाज़ार' },
    'analyzing_weather': { en: 'Analyzing local weather...', hi: 'मौसम का विश्लेषण कर रहा है...' },
    'enter_city_crop_ai': { en: 'Enter City and Crop to generate AI harvest insights', hi: 'एआई जानकारी के लिए शहर और फसल दर्ज करें' },
    'quick_links_schemes': { en: '🏛️ Quick Links — Government Schemes', hi: '🏛️ त्वरित लिंक — सरकारी योजनाएं' },
    'based_on_land': { en: 'Based on your land', hi: 'आपकी भूमि के आधार पर' },
    'acres': { en: 'acres', hi: 'एकड़' },
    'your_state': { en: 'your state', hi: 'आपका राज्य' },
    'apply_now': { en: 'Apply →', hi: 'आवेदन करें →' },

    // Crop AI Specific
    'interactive_predictor': { en: 'Interactive Predictor', hi: 'इंटरएक्टिव प्रिडिक्टर' },
    'ml_price_predictor': { en: 'Machine Learning Price Predictor', hi: 'मशीन लर्निंग मूल्य अनुमानक' },
    'ml_desc': { en: 'Experiment with expected market arrival volumes to instantly see how supply impacts future prices based on our Linear Regression model trained on Agmarknet data.', hi: 'बाजार में आवक की मात्रा का अनुमान लगाकर तुरंत देखें कि आपूर्ति भविष्य की कीमतों को कैसे प्रभावित करती है। यह एगमार्कनेट डेटा पर प्रशिक्षित हमारे मशीन लर्निंग मॉडल पर आधारित है।' },
    'sim_variables': { en: 'Simulation Variables', hi: 'सिमुलेशन चर (Variables)' },
    'select_commodity': { en: 'Select Commodity', hi: 'वस्तु (Commodity) चुनें' },
    'expected_arrival': { en: 'Expected Arrival Volume (Tonnes)', hi: 'संभावित आवक (टन)' },
    'last': { en: 'Last', hi: 'पिछला' },
    'adjust_volume_tip': { en: 'Adjust volume to simulate supply shocks. Higher volumes generally indicate lower prices.', hi: 'आपूर्ति झटके का अनुकरण करने के लिए मात्रा समायोजित करें। उच्च मात्रा आम तौर पर कम कीमतों का संकेत देती है।' },
    'insufficient_data': { en: 'Insufficient historical data points to construct a regression model for this crop.', hi: 'इस फसल के लिए प्रतिगमन (regression) मॉडल बनाने के लिए पर्याप्त ऐतिहासिक डेटा नहीं है।' },
    'predicted_output': { en: 'Predicted Price Output', hi: 'अनुमानित मूल्य आउटपुट' },
    'per_quintal': { en: '/ Quintal', hi: '/ क्विंटल' },
    'model_logic': { en: 'Model Logic', hi: 'मॉडल लॉजिक' },
    'price_eq': { en: 'Price =', hi: 'मूल्य =' },
    'ml_note': { en: '* Note: ML model constraints prevent variance > 25% from currently traded prices.', hi: '* ध्यान दें: मशीन लर्निंग मॉडल वर्तमान में कारोबार की कीमतों से 25% से अधिक भिन्नता को रोकता है।' },
    'data_unavailable': { en: 'Data unavailable for calculation.', hi: 'गणना के लिए डेटा उपलब्ध नहीं है।' },
    'failed_market_data': { en: 'Failed to load Market Data.', hi: 'बाज़ार डेटा लोड करने में विफल।' },

    // Mandi Map Specific
    'market_operations': { en: 'Market Operations', hi: 'बाज़ार संचालन' },
    'smart_mandi_finder': { en: 'Smart Mandi Finder', hi: 'स्मार्ट मंडी खोजक' },
    'find_nearby_markets': { en: 'Find Nearby Markets', hi: 'आसपास के बाज़ार खोजें' },
    'mandi_finder_desc': { en: 'Enter your PIN code to instantly geolocate nearby Mandis and calculate your actual Net Profit after transportation costs.', hi: 'आस-पास की मंडियों का पता लगाने के लिए अपना पिन कोड दर्ज करें और परिवहन लागत के बाद अपने वास्तविक शुद्ध लाभ की गणना करें।' },
    'enter_pin_code': { en: 'Enter 6-digit PIN Code...', hi: '6 अंकों का पिन कोड दर्ज करें...' },
    'search_area': { en: 'Search Area', hi: 'क्षेत्र खोजें' },
    'profit_optimizer': { en: 'Profit Optimizer', hi: 'लाभ अनुकूलक (Optimizer)' },
    'ranked_by': { en: 'Ranked by', hi: 'द्वारा क्रमबद्ध:' },
    'net_return': { en: 'Net Return', hi: 'शुद्ध लाभ' },
    'price_minus_transport': { en: '(Price − Transport)', hi: '(मूल्य - परिवहन)' },
    'enter_pin_prompt': { en: 'Enter your PIN code above to find the optimal mandis for your crop.', hi: 'अपनी फसल के लिए सर्वोत्तम मंडी खोजने के लिए ऊपर अपना पिन कोड दर्ज करें।' },
    'expert_tips': { en: 'Expert Tips', hi: 'विशेषज्ञ सुझाव' },
    'detected_region': { en: 'Detected Region', hi: 'ज्ञात क्षेत्र' },
    'net': { en: 'Net', hi: 'शुद्ध' },
    'loading_maps': { en: 'Loading Maps...', hi: 'नक्शे लोड हो रहे हैं...' },

    // Spoilage Specific
    'spoilage_risk': { en: 'Spoilage & Storage Risk', hi: 'खराबी और भंडारण जोखिम' },
    'post_harvest_analyzer': { en: 'Post-Harvest Risk Analyzer', hi: 'कटाई के बाद का जोखिम विश्लेषक' },
    'ai_assesses_spoilage': { en: 'AI assesses spoilage risk and ranks preservation actions by cost', hi: 'एआई खराब होने के जोखिम का आकलन करता है और लागत के आधार पर संरक्षण कार्यों को क्रमबद्ध करता है' },
    'crop': { en: 'Crop', hi: 'फसल' },
    'storage_type': { en: 'Storage Type', hi: 'भंडारण का प्रकार' },
    'analyzing': { en: 'Analyzing...', hi: 'विश्लेषण कर रहा है...' },
    'ai_risk_assessment': { en: 'AI Risk Assessment', hi: 'एआई जोखिम मूल्यांकन' },
    'temperature': { en: 'Temperature', hi: 'तापमान' },
    'transit_days': { en: 'Transit Days', hi: 'परिवहन के दिन' },
    'spoilage_risk_meter': { en: 'Spoilage Risk Meter', hi: 'खराबी जोखिम मीटर' },
    'risk': { en: 'Risk', hi: 'जोखिम' },
    'transit': { en: 'Transit', hi: 'परिवहन' },
    'risk_level': { en: 'Risk Level', hi: 'जोखिम का स्तर' },
    'estimated_loss': { en: '📉 Estimated crop loss without action:', hi: '📉 बिना कार्रवाई के अनुमानित फसल नुकसान:' },
    'immediate_actions': { en: 'Immediate Actions', hi: 'तत्काल कार्रवाइयां' },
    'run_ai_guidance': { en: 'Run AI assessment to get immediate action guidance for your crop.', hi: 'अपनी फसल के लिए तत्काल कार्रवाई मार्गदर्शन प्राप्त करने के लिए एआई मूल्यांकन चलाएं।' },
    'weather_impact': { en: 'Weather Impact', hi: 'मौसम का प्रभाव' },
    'safe_storage_timeline': { en: 'Safe Storage Timeline', hi: 'सुरक्षित भंडारण समयरेखा' },
    'quality_degradation': { en: 'Quality Degradation Curve', hi: 'गुणवत्ता गिरावट वक्र' },
    'safe_storage_window': { en: '✅ Safe storage window:', hi: '✅ सुरक्षित भंडारण खिड़की:' },
    'preservation_actions': { en: 'Preservation Actions (Ranked by Cost)', hi: 'संरक्षण कार्रवाइयां (लागत द्वारा क्रमबद्ध)' },
    'ai_ranked_cost': { en: 'AI-ranked from free/low-cost methods to strategic investments.', hi: 'एआई द्वारा मुफ्त/कम लागत वाली विधियों से लेकर रणनीतिक निवेश तक क्रमबद्ध।' },
    'how_to_do_it': { en: 'How to do it:', hi: 'यह कैसे करें:' },
    'cost_label': { en: 'Cost:', hi: 'लागत:' },
    'amazon_equip': { en: '🛒 Find Equipment on Amazon', hi: '🛒 अमेज़न पर उपकरण खोजें' },

    // Schemes Specific
    'gov_scheme_matcher': { en: 'Government Scheme Matcher', hi: 'सरकारी योजना मैचमेकर' },
    'all_states': { en: 'Government Scheme Matcher — All States', hi: 'सरकारी योजना मैचमेकर — सभी राज्य' },
    'schemes_matched': { en: 'schemes matched to your crop and region', hi: 'योजनाएं आपकी फसल और क्षेत्र से मेल खाती हैं' },
    'insurance': { en: 'Insurance', hi: 'बीमा' },
    'income': { en: 'Income', hi: 'आय' },
    'credit': { en: 'Credit', hi: 'ऋण' },
    'market': { en: 'Market', hi: 'बाज़ार' },
    'irrigation': { en: 'Irrigation', hi: 'सिंचाई' },
    'soil': { en: 'Soil', hi: 'मिट्टी' },

    // Dynamic Scheme Translations
    'pmfby_title': { en: 'PM Fasal Bima Yojana', hi: 'प्रधानमंत्री फसल बीमा योजना' },
    'pmfby_desc': { en: 'Crop insurance against natural calamities. Premium as low as 1.5% of sum insured.', hi: 'प्राकृतिक आपदाओं के खिलाफ फसल बीमा। बीमित राशि का 1.5% जितना कम प्रीमियम।' },
    'pmkisan_title': { en: 'PM-KISAN Samman Nidhi', hi: 'पीएम-किसान सम्मान निधि' },
    'pmkisan_desc': { en: '₹6,000/year direct income support in 3 installments to all eligible farmers.', hi: 'सभी पात्र किसानों को 3 किस्तों में ₹6,000/वर्ष की प्रत्यक्ष आय सहायता।' },
    'kcc_title': { en: 'Kisan Credit Card (KCC)', hi: 'किसान क्रेडिट कार्ड (KCC)' },
    'kcc_desc': { en: 'Low-interest crop loan up to ₹3 lakh at 4% p.a. for production credit needs.', hi: 'उत्पादन ऋण आवश्यकताओं के लिए 4% प्रति वर्ष की दर से ₹3 लाख तक का कम ब्याज वाला फसल ऋण।' },
    'enam_title': { en: 'eNAM Digital Market', hi: 'ई-नाम (eNAM) डिजिटल बाज़ार' },
    'enam_desc': { en: 'Online mandi platform. 1000+ mandis. Direct access to buyers across India.', hi: 'ऑनलाइन मंडी प्लेटफॉर्म। 1000+ मंडियां। पूरे भारत में खरीदारों तक सीधी पहुंच।' },
    'pmksy_title': { en: 'PM Krishi Sinchai Yojana', hi: 'पीएम कृषि सिंचाई योजना' },
    'pmksy_desc': { en: 'Micro-irrigation subsidy. 55% for small/marginal farmers, 45% for others.', hi: 'सूक्ष्म सिंचाई सब्सिडी। छोटे/सीमांत किसानों के लिए 55%, अन्य के लिए 45%।' },
    'shc_title': { en: 'Soil Health Card Scheme', hi: 'मृदा स्वास्थ्य कार्ड योजना' },
    'shc_desc': { en: 'Free soil testing every 2 years. Nutrient-specific fertilizer recommendations.', hi: 'हर 2 साल में मुफ्त मिट्टी परीक्षण। पोषक तत्व-विशिष्ट उर्वरक सिफारिशें।' }
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
