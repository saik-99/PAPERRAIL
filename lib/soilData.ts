// ICAR-based soil health lookup table
// Source: ICAR Soil Resource mapping + NBSS&LUP publications
// This provides regional soil health proxies for AI recommendations

export interface SoilProfile {
    soilType: string;
    pH: number;
    phStatus: 'Ideal' | 'Slightly Off' | 'Poor';
    organicMatter: 'High' | 'Medium' | 'Low';
    drainage: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
    waterRetention: 'High' | 'Medium' | 'Low';
    cropSuitability: Record<string, 'Excellent' | 'Good' | 'Moderate' | 'Poor'>;
    notes: string;
}

// State-level dominant soil profiles (ICAR NBSS&LUP data)
const STATE_SOIL_PROFILES: Record<string, SoilProfile> = {
    'Punjab': {
        soilType: 'Alluvial (Indo-Gangetic)',
        pH: 7.8,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Wheat: 'Excellent', Rice: 'Excellent', Cotton: 'Good',
            Maize: 'Good', Sugarcane: 'Good', Onion: 'Moderate',
            Potato: 'Good', Tomato: 'Good',
        },
        notes: 'High fertility alluvial—excellent for rabi crops. Prone to waterlogging in kharif if not drained.',
    },
    'Haryana': {
        soilType: 'Alluvial / Sandy Loam',
        pH: 7.5,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Wheat: 'Excellent', Rice: 'Good', Cotton: 'Excellent',
            Mustard: 'Excellent', Sugarcane: 'Good', Onion: 'Good',
            Potato: 'Good', Tomato: 'Moderate',
        },
        notes: 'Well-drained alluvial. Good for both kharif and rabi. Watch for salinity in canal zones.',
    },
    'Uttar Pradesh': {
        soilType: 'Alluvial (Gangetic Plain)',
        pH: 7.2,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Moderate',
        waterRetention: 'High',
        cropSuitability: {
            Wheat: 'Excellent', Rice: 'Excellent', Sugarcane: 'Excellent',
            Potato: 'Excellent', Mustard: 'Good', Maize: 'Good',
            Tomato: 'Good', Onion: 'Good',
        },
        notes: 'Rich Gangetic alluvial — top producer of wheat and sugarcane. Eastern UP has higher clay content.',
    },
    'Madhya Pradesh': {
        soilType: 'Black Cotton Soil (Vertisol)',
        pH: 7.8,
        phStatus: 'Ideal',
        organicMatter: 'High',
        drainage: 'Poor',
        waterRetention: 'High',
        cropSuitability: {
            Cotton: 'Excellent', Soybean: 'Excellent', Wheat: 'Good',
            Chickpea: 'Excellent', Rice: 'Moderate', Maize: 'Good',
            Onion: 'Moderate', Tomato: 'Moderate',
        },
        notes: 'Heavy black soils with high clay. Excellent for cotton and soybean. Avoid over-irrigation — drains slowly.',
    },
    'Maharashtra': {
        soilType: 'Black Basaltic (Vertisol)',
        pH: 7.6,
        phStatus: 'Ideal',
        organicMatter: 'High',
        drainage: 'Moderate',
        waterRetention: 'High',
        cropSuitability: {
            Cotton: 'Excellent', Sugarcane: 'Excellent', Soybean: 'Excellent',
            Wheat: 'Good', Chickpea: 'Good', Onion: 'Excellent',
            Tomato: 'Good', Grapes: 'Excellent',
        },
        notes: 'Deccan black soils — very fertile. Vidarbha zone better for cotton, Nashik for onion and grapes.',
    },
    'Gujarat': {
        soilType: 'Medium Black / Sandy Loam',
        pH: 7.5,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Cotton: 'Excellent', Groundnut: 'Excellent', Wheat: 'Good',
            Castor: 'Excellent', Onion: 'Good', Potato: 'Good',
            Tomato: 'Good', Rice: 'Moderate',
        },
        notes: 'Mix of black and sandy soils. Saurashtra excels for groundnut; North Gujarat for cotton.',
    },
    'Rajasthan': {
        soilType: 'Desert / Sandy (Aridisol)',
        pH: 8.1,
        phStatus: 'Slightly Off',
        organicMatter: 'Low',
        drainage: 'Excellent',
        waterRetention: 'Low',
        cropSuitability: {
            Mustard: 'Excellent', Wheat: 'Good', Bajra: 'Excellent',
            Groundnut: 'Good', Guar: 'Excellent', Cotton: 'Moderate',
            Tomato: 'Moderate', Onion: 'Moderate',
        },
        notes: 'Sandy alkaline soils. Excellent for mustard and bajra. Irrigation essential — poor water retention.',
    },
    'Karnataka': {
        soilType: 'Red Laterite / Black Mixed',
        pH: 6.2,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Ragi: 'Excellent', Sugarcane: 'Excellent', Cotton: 'Good',
            Rice: 'Good', Maize: 'Good', Tomato: 'Excellent',
            Onion: 'Good', Grapes: 'Good',
        },
        notes: 'Red soils in north, black in south. Good for ragi and vegetables. Careful with acidic patches.',
    },
    'Andhra Pradesh': {
        soilType: 'Red Sandy / Alluvial Delta',
        pH: 6.5,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Rice: 'Excellent', Cotton: 'Good', Groundnut: 'Excellent',
            Maize: 'Excellent', Chilli: 'Excellent', Tomato: 'Excellent',
            Onion: 'Good', Tobacco: 'Good',
        },
        notes: 'Fertile Krishna-Godavari delta alluvial. Excellent for rice and chilli. Good drainage in upland.',
    },
    'Tamil Nadu': {
        soilType: 'Red Loam / Alluvial',
        pH: 6.8,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Rice: 'Excellent', Cotton: 'Good', Groundnut: 'Excellent',
            Sugarcane: 'Excellent', Banana: 'Excellent', Tomato: 'Good',
            Onion: 'Good', Maize: 'Good',
        },
        notes: 'Varied soils. Cauvery delta — excellent rice. Red loam good for groundnut and maize.',
    },
    'West Bengal': {
        soilType: 'Alluvial (Gangetic Delta)',
        pH: 6.5,
        phStatus: 'Ideal',
        organicMatter: 'High',
        drainage: 'Moderate',
        waterRetention: 'High',
        cropSuitability: {
            Rice: 'Excellent', Jute: 'Excellent', Potato: 'Excellent',
            Vegetables: 'Excellent', Maize: 'Good', Wheat: 'Moderate',
            Tomato: 'Good', Onion: 'Good',
        },
        notes: 'Rich delta soils — top jute and rice producer. High organic matter from annual flooding.',
    },
    'Bihar': {
        soilType: 'Alluvial (North Bihar / Floodplain)',
        pH: 7.1,
        phStatus: 'Ideal',
        organicMatter: 'Medium',
        drainage: 'Moderate',
        waterRetention: 'High',
        cropSuitability: {
            Rice: 'Excellent', Wheat: 'Excellent', Maize: 'Excellent',
            Potato: 'Good', Sugarcane: 'Good', Lichi: 'Excellent',
            Tomato: 'Good', Onion: 'Moderate',
        },
        notes: 'Fertile Gangetic alluvial. Great for maize and rice. North Bihar prone to floods.',
    },
    'Odisha': {
        soilType: 'Red Laterite / Alluvial Coastal',
        pH: 5.8,
        phStatus: 'Slightly Off',
        organicMatter: 'Medium',
        drainage: 'Good',
        waterRetention: 'Medium',
        cropSuitability: {
            Rice: 'Excellent', Oilseeds: 'Good', Maize: 'Good',
            Sugarcane: 'Moderate', Tomato: 'Good', Onion: 'Moderate',
            Groundnut: 'Good', Turmeric: 'Excellent',
        },
        notes: 'Laterite soils — slightly acidic. Good liming helps. Coastal alluvial excellent for rice.',
    },
    'Kerala': {
        soilType: 'Laterite / Red Loam',
        pH: 5.5,
        phStatus: 'Slightly Off',
        organicMatter: 'High',
        drainage: 'Good',
        waterRetention: 'High',
        cropSuitability: {
            Rice: 'Excellent', Coconut: 'Excellent', Rubber: 'Excellent',
            Banana: 'Excellent', Pepper: 'Excellent', Tapioca: 'Excellent',
            Vegetables: 'Good', Spices: 'Excellent',
        },
        notes: 'Acidic laterite — ideal for spices, rubber, coconut. Apply lime for vegetables.',
    },
    'Himachal Pradesh': {
        soilType: 'Brown Hill Soil / Sandy Loam',
        pH: 6.3,
        phStatus: 'Ideal',
        organicMatter: 'High',
        drainage: 'Excellent',
        waterRetention: 'Low',
        cropSuitability: {
            Apple: 'Excellent', Potato: 'Excellent', Wheat: 'Good',
            Maize: 'Good', Vegetables: 'Excellent', Peas: 'Excellent',
            Tomato: 'Excellent', Ginger: 'Excellent',
        },
        notes: 'Mountain soils — high organic matter, excellent drainage. Temperature limits tropical crops.',
    },
};

const DEFAULT_SOIL: SoilProfile = {
    soilType: 'Mixed Alluvial',
    pH: 7.0,
    phStatus: 'Ideal',
    organicMatter: 'Medium',
    drainage: 'Good',
    waterRetention: 'Medium',
    cropSuitability: {
        Wheat: 'Good', Rice: 'Good', Cotton: 'Moderate',
        Onion: 'Good', Tomato: 'Good', Maize: 'Good',
    },
    notes: 'General alluvial profile. Soil test recommended for precise management.',
};

export function getSoilProfile(state: string): SoilProfile {
    // Try exact match first
    if (STATE_SOIL_PROFILES[state]) return STATE_SOIL_PROFILES[state];
    // Try case-insensitive
    const normalized = Object.keys(STATE_SOIL_PROFILES).find(
        k => k.toLowerCase() === state.toLowerCase()
    );
    return normalized ? STATE_SOIL_PROFILES[normalized] : DEFAULT_SOIL;
}

export function getCropSuitability(state: string, crop: string): string {
    const profile = getSoilProfile(state);
    const cropKey = Object.keys(profile.cropSuitability).find(
        k => k.toLowerCase() === crop.toLowerCase()
    );
    return cropKey ? profile.cropSuitability[cropKey] : 'Moderate';
}

export function getSoilHealthScore(state: string, crop: string): number {
    const profile = getSoilProfile(state);
    const suitability = getCropSuitability(state, crop);

    let base = 60;
    if (suitability === 'Excellent') base = 90;
    else if (suitability === 'Good') base = 75;
    else if (suitability === 'Moderate') base = 55;
    else base = 35;

    if (profile.organicMatter === 'High') base += 5;
    if (profile.organicMatter === 'Low') base -= 5;
    if (profile.phStatus === 'Poor') base -= 10;
    if (profile.phStatus === 'Slightly Off') base -= 3;

    return Math.min(100, Math.max(10, base));
}

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Odisha',
    'Punjab', 'Rajasthan', 'Tamil Nadu',
    'Uttar Pradesh', 'West Bengal',
];

export const COMMON_CROPS = [
    'Wheat', 'Rice', 'Cotton', 'Onion', 'Tomato',
    'Potato', 'Maize', 'Sugarcane', 'Soybean',
    'Mustard', 'Groundnut', 'Chickpea', 'Chilli',
];
