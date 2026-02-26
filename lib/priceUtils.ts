// Price utilities — loads WPI JSON and computes trend analysis
// Used by the harvest advisor AI to understand if now is a good time to sell

import { readFileSync } from 'fs';
import path from 'path';

export interface WPIRecord {
    commodity: string;
    weight: number | null;
    series: { month: string; index: number }[];
}

export interface PriceTrend {
    commodity: string;
    latestIndex: number;
    previousIndex: number;
    change: number;        // percentage change
    direction: 'Rising' | 'Falling' | 'Stable';
    seasonalScore: number; // 0-100, 100 = historically best month to sell
    trend12m: { month: string; index: number }[]; // last 12 months
    averageIndex: number;
    peakMonth: string;
    insight: string; // plain language
}

let cachedData: WPIRecord[] | null = null;

function loadWPIData(): WPIRecord[] {
    if (cachedData) return cachedData;
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'wpi_summary.json');
        cachedData = JSON.parse(readFileSync(filePath, 'utf-8')) as WPIRecord[];
        return cachedData;
    } catch {
        return [];
    }
}

export function getCropPriceTrend(cropName: string): PriceTrend | null {
    const data = loadWPIData();
    if (!data.length) return null;

    // Find best matching commodity
    const match = data.find(r =>
        r.commodity.toLowerCase().includes(cropName.toLowerCase()) ||
        cropName.toLowerCase().includes(r.commodity.toLowerCase().split(' ')[0])
    );

    if (!match || !match.series || match.series.length < 2) return null;

    const series = match.series;
    const last12 = series.slice(-12);
    const latestIndex = last12[last12.length - 1].index;
    const previousIndex = last12[last12.length - 2].index;
    const change = ((latestIndex - previousIndex) / previousIndex) * 100;

    const direction: 'Rising' | 'Falling' | 'Stable' =
        change > 2 ? 'Rising' : change < -2 ? 'Falling' : 'Stable';

    const averageIndex = last12.reduce((s, d) => s + d.index, 0) / last12.length;

    // Find peak month from historical data
    const peakEntry = [...last12].sort((a, b) => b.index - a.index)[0];
    const peakMonth = peakEntry.month;

    // Seasonal score: how does current month compare to historical average?
    const deviationFromAvg = ((latestIndex - averageIndex) / averageIndex) * 100;
    const seasonalScore = Math.max(0, Math.min(100, 50 + deviationFromAvg * 2));

    let insight = '';
    if (direction === 'Rising') {
        insight = `${match.commodity} prices are rising (up ${change.toFixed(1)}%). Holding crop for 1-2 weeks may yield better returns.`;
    } else if (direction === 'Falling') {
        insight = `${match.commodity} prices are falling (down ${Math.abs(change).toFixed(1)}%). Selling sooner may be better than waiting.`;
    } else {
        insight = `${match.commodity} prices are stable. Current market is predictable — good time to sell at current rates.`;
    }

    return {
        commodity: match.commodity,
        latestIndex,
        previousIndex,
        change: Math.round(change * 10) / 10,
        direction,
        seasonalScore: Math.round(seasonalScore),
        trend12m: last12,
        averageIndex: Math.round(averageIndex * 10) / 10,
        peakMonth,
        insight,
    };
}

// Seasonal harvest guidance based on crop and month
export function getSeasonalHarvestGuidance(crop: string, month: number): {
    isOptimalSeason: boolean;
    seasonLabel: string;
    priceExpectation: string;
    guidance: string;
} {
    const cropLower = crop.toLowerCase();

    // Kharif crops (harvested Oct-Dec)
    const kharifCrops = ['rice', 'cotton', 'soybean', 'maize', 'groundnut', 'sugarcane', 'onion'];
    // Rabi crops (harvested Mar-May)
    const rabiCrops = ['wheat', 'mustard', 'chickpea', 'potato', 'barley'];

    const isKharif = kharifCrops.some(c => cropLower.includes(c));
    const isRabi = rabiCrops.some(c => cropLower.includes(c));

    let isOptimalSeason = false;
    let seasonLabel = '';
    let priceExpectation = '';
    let guidance = '';

    if (isKharif) {
        if (month >= 10 && month <= 12) {
            isOptimalSeason = true;
            seasonLabel = 'Kharif Harvest Season';
            priceExpectation = 'Prices typically volatile at harvest — monitor weekly';
            guidance = 'Prime harvest window for kharif crops. Sell within 2-3 weeks of harvesting.';
        } else if (month >= 1 && month <= 3) {
            seasonLabel = 'Post-Kharif (Off-season)';
            priceExpectation = 'Prices typically higher — demand exceeds supply';
            guidance = 'Off-season stock can fetch premium prices. If stored well, consider selling now.';
        } else {
            seasonLabel = 'Kharif Growing Season';
            priceExpectation = 'Pre-harvest period — prices may be elevated';
            guidance = 'Crop is still growing. Focus on quality inputs for better harvest yield.';
        }
    } else if (isRabi) {
        if (month >= 3 && month <= 5) {
            isOptimalSeason = true;
            seasonLabel = 'Rabi Harvest Season';
            priceExpectation = 'Peak supply — prices may dip slightly at harvest time';
            guidance = 'Rabi harvest season. Consider staggered selling to avoid market glut.';
        } else if (month >= 6 && month <= 9) {
            seasonLabel = 'Post-Rabi (Off-season)';
            priceExpectation = 'Prices good if you have stored stock';
            guidance = 'Off-season period. Well-stored rabi produce commands premium.';
        } else {
            seasonLabel = 'Rabi Sowing/Growing Season';
            priceExpectation = 'Previous year stock being exhausted — prices rising';
            guidance = 'Crop is growing. Good time to plan harvest logistics ahead.';
        }
    } else {
        isOptimalSeason = month >= 10 || month <= 5; // broad harvest season
        seasonLabel = 'General Harvest Period';
        priceExpectation = 'Check local mandi rates';
        guidance = 'Monitor local mandi prices weekly. Sell when prices stabilize above MSP.';
    }

    return { isOptimalSeason, seasonLabel, priceExpectation, guidance };
}

// Known MSP (Minimum Support Price) reference values — FY 2024-25
// Source: CACP / Dept. of Agriculture, Govt. of India
export const MSP_REFERENCE: Record<string, { msp: number; unit: string }> = {
    'Wheat': { msp: 2275, unit: '₹/quintal' },
    'Rice': { msp: 2300, unit: '₹/quintal' },
    'Maize': { msp: 2090, unit: '₹/quintal' },
    'Cotton (Medium)': { msp: 7121, unit: '₹/quintal' },
    'Cotton (Long)': { msp: 7521, unit: '₹/quintal' },
    'Soybean': { msp: 4892, unit: '₹/quintal' },
    'Groundnut': { msp: 6783, unit: '₹/quintal' },
    'Mustard': { msp: 5950, unit: '₹/quintal' },
    'Chickpea': { msp: 5440, unit: '₹/quintal' },
    'Sugarcane': { msp: 340, unit: '₹/quintal (FRP)' },
};

export function getMSP(crop: string): { msp: number; unit: string } | null {
    const key = Object.keys(MSP_REFERENCE).find(k =>
        k.toLowerCase().includes(crop.toLowerCase()) ||
        crop.toLowerCase().includes(k.toLowerCase().split(' ')[0])
    );
    return key ? MSP_REFERENCE[key] : null;
}
