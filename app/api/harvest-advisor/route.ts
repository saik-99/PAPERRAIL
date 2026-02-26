export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSoilProfile, getSoilHealthScore, getCropSuitability } from '@/lib/soilData';
import { fetchWeatherData, getMockWeatherSummary, getCoordinatesForCity } from '@/lib/weatherUtils';
import { getCropPriceTrend, getSeasonalHarvestGuidance, getMSP } from '@/lib/priceUtils';

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro'];

async function callGemini(prompt: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes('404') || msg.includes('not found') || msg.includes('not supported')) {
                continue;
            }
            console.error(`Gemini model ${modelName} error:`, msg);
            return null;
        }
    }
    return null;
}

// Nearby mandi data — curated by state
const STATE_MANDIS: Record<string, Array<{
    name: string; distance: number; transportCostPerQ: number;
    avgPrice: number; priceMin: number; priceMax: number; specialty: string;
}>> = {
    Punjab: [
        { name: 'Khanna Grain Mandi (APMC)', distance: 35, transportCostPerQ: 210, avgPrice: 5355, priceMin: 5266, priceMax: 5415, specialty: 'Wheat, Rice' },
        { name: 'Ludhiana Veg Market', distance: 12, transportCostPerQ: 72, avgPrice: 5212, priceMin: 5068, priceMax: 5386, specialty: 'Vegetables, Pulses' },
        { name: 'Jalandhar Grain Hub', distance: 64, transportCostPerQ: 264, avgPrice: 5315, priceMin: 5253, priceMax: 5383, specialty: 'Wheat, Oilseeds' },
        { name: 'Amritsar Central Mandi', distance: 58, transportCostPerQ: 348, avgPrice: 5223, priceMin: 5087, priceMax: 5312, specialty: 'Cotton, Wheat' },
    ],
    Haryana: [
        { name: 'Karnal Grain Mandi', distance: 20, transportCostPerQ: 120, avgPrice: 5300, priceMin: 5200, priceMax: 5380, specialty: 'Wheat, Paddy' },
        { name: 'Hisar APMC', distance: 45, transportCostPerQ: 270, avgPrice: 5250, priceMin: 5100, priceMax: 5360, specialty: 'Cotton, Wheat' },
        { name: 'Rohtak Market', distance: 30, transportCostPerQ: 180, avgPrice: 5180, priceMin: 5050, priceMax: 5310, specialty: 'Wheat, Vegetables' },
    ],
    Maharashtra: [
        { name: 'Nashik APMC', distance: 25, transportCostPerQ: 150, avgPrice: 1800, priceMin: 1600, priceMax: 2100, specialty: 'Onion, Grapes, Tomato' },
        { name: 'Pune Market Yard', distance: 60, transportCostPerQ: 360, avgPrice: 2200, priceMin: 2000, priceMax: 2500, specialty: 'Vegetables, Fruits' },
        { name: 'Nagpur Central APMC', distance: 15, transportCostPerQ: 90, avgPrice: 1950, priceMin: 1750, priceMax: 2200, specialty: 'Cotton, Soybean' },
        { name: 'Aurangabad Mandi', distance: 80, transportCostPerQ: 480, avgPrice: 1700, priceMin: 1550, priceMax: 1900, specialty: 'Soybean, Cotton' },
    ],
    'Madhya Pradesh': [
        { name: 'Indore SAMB Mandi', distance: 20, transportCostPerQ: 120, avgPrice: 4800, priceMin: 4600, priceMax: 5000, specialty: 'Soybean, Wheat, Onion' },
        { name: 'Ujjain Krishi Mandi', distance: 55, transportCostPerQ: 330, avgPrice: 4650, priceMin: 4500, priceMax: 4850, specialty: 'Soybean, Wheat' },
        { name: 'Bhopal APMC', distance: 90, transportCostPerQ: 540, avgPrice: 4900, priceMin: 4750, priceMax: 5050, specialty: 'Wheat, Chickpea' },
    ],
    Gujarat: [
        { name: 'Ahmedabad Wholesale Market', distance: 30, transportCostPerQ: 180, avgPrice: 6500, priceMin: 6200, priceMax: 6800, specialty: 'Groundnut, Cotton' },
        { name: 'Rajkot APMC', distance: 15, transportCostPerQ: 90, avgPrice: 6200, priceMin: 5900, priceMax: 6500, specialty: 'Groundnut, Cotton' },
        { name: 'Surat Vegetable Market', distance: 70, transportCostPerQ: 420, avgPrice: 2800, priceMin: 2600, priceMax: 3100, specialty: 'Vegetables, Fruits' },
    ],
    'Uttar Pradesh': [
        { name: 'Agra APMC', distance: 25, transportCostPerQ: 150, avgPrice: 2150, priceMin: 2050, priceMax: 2280, specialty: 'Potato, Wheat' },
        { name: 'Lucknow Krishi Mandi', distance: 40, transportCostPerQ: 240, avgPrice: 2200, priceMin: 2100, priceMax: 2350, specialty: 'Wheat, Rice' },
        { name: 'Kanpur APMC', distance: 60, transportCostPerQ: 360, avgPrice: 2100, priceMin: 2000, priceMax: 2250, specialty: 'Wheat, Oilseeds' },
    ],
    default: [
        { name: 'Local District APMC', distance: 20, transportCostPerQ: 120, avgPrice: 2500, priceMin: 2300, priceMax: 2700, specialty: 'All commodities' },
        { name: 'State Agricultural Market', distance: 45, transportCostPerQ: 270, avgPrice: 2650, priceMin: 2450, priceMax: 2850, specialty: 'All commodities' },
        { name: 'Regional Mandi', distance: 70, transportCostPerQ: 420, avgPrice: 2800, priceMin: 2600, priceMax: 3000, specialty: 'All commodities' },
    ],
};

function getMandisForState(state: string) {
    const key = Object.keys(STATE_MANDIS).find(k => k.toLowerCase() === state.toLowerCase());
    return (key ? STATE_MANDIS[key] : STATE_MANDIS.default)
        .map(m => ({ ...m, netProfit: m.avgPrice - m.transportCostPerQ }))
        .sort((a, b) => b.netProfit - a.netProfit);
}

function buildFallbackRecommendation(
    crop: string, state: string,
    weather: { harvestWindowScore: number; harvestWindowLabel: string; rainDaysNext7: number; avgHumidityNext7: number },
    soilScore: number, cropSuitability: string,
    priceTrend: { direction: string; change: number; insight: string } | null,
    seasonal: { isOptimalSeason: boolean; seasonLabel: string; priceExpectation: string; guidance: string },
    bestMandi: { name: string; netProfit: number; transportCostPerQ: number; distance: number; avgPrice: number }
) {
    const goodWeather = weather.harvestWindowScore >= 60;
    const decision = goodWeather && seasonal.isOptimalSeason ? 'HARVEST_NOW'
        : weather.rainDaysNext7 >= 4 ? 'WAIT_DAYS' : goodWeather ? 'HARVEST_NOW' : 'WAIT_DAYS';
    const waitDays = decision === 'WAIT_DAYS' ? Math.min(weather.rainDaysNext7 + 1, 7) : 0;
    const confidence = Math.round((weather.harvestWindowScore * 0.4) + (soilScore * 0.35) + (seasonal.isOptimalSeason ? 25 : 10));

    return {
        harvestDecision: decision,
        waitDays,
        confidence: Math.min(90, confidence),
        plainSummary: decision === 'HARVEST_NOW'
            ? `Abhi harvest karna sahi rahega! ${state} mein ${crop} ke liye conditions acchi hain — weather clear hai aur ${seasonal.seasonLabel} chal rahi hai.`
            : `${waitDays} din aur ruk jaiye. Agle ${weather.rainDaysNext7} din baarish expected hai jo fasal ko nuksan kar sakti hai. Uske baad conditions behtar hongi.`,
        weatherReason: `Agle 7 dinon mein ${weather.rainDaysNext7} din baarish expected hai. Average humidity ${weather.avgHumidityNext7}% hai. Harvest Window Score: ${weather.harvestWindowScore}/100 — ${weather.harvestWindowLabel}.`,
        priceReason: priceTrend
            ? `${crop} ke WPI index mein ${priceTrend.change > 0 ? '+' : ''}${priceTrend.change}% change hua hai — ${priceTrend.direction}. ${priceTrend.insight}`
            : `${seasonal.priceExpectation}. ${seasonal.guidance}`,
        soilReason: `${state} ki mitti ${crop} ke liye ${cropSuitability} hai. Soil health score: ${soilScore}/100.`,
        actionPlan: [
            decision === 'HARVEST_NOW' ? 'Agle 48 ghanton mein harvest shuru karein' : `${waitDays} din baarish hone do, phir harvest karein`,
            `${bestMandi.name} par transport ke liye arrangement karein (${bestMandi.distance}km)`,
            'Fasal kaatne ke baad seedha dhakki hui gaadi mein rakhein',
            `Mandi mein mangalwar ya budhwar ko jaiye — behtar rates milte hain`,
        ],
        bestMandiName: bestMandi.name,
        bestMandiReason: `Net profit sabse zyada: ₹${bestMandi.netProfit}/quintal (offered ₹${bestMandi.avgPrice} minus transport ₹${bestMandi.transportCostPerQ}). Sirf ${bestMandi.distance}km door.`,
        harvestWindowEmoji: decision === 'HARVEST_NOW' ? '✅' : '⏳',
        urgencyLevel: weather.rainDaysNext7 >= 4 ? 'HIGH' : decision === 'HARVEST_NOW' ? 'MEDIUM' : 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW',
    };
}

export async function POST(req: NextRequest) {
    try {
        const { crop, state, city, lat, lon } = await req.json();

        if (!crop || !state) {
            return NextResponse.json({ error: 'crop and state are required' }, { status: 400 });
        }

        const currentMonth = new Date().getMonth() + 1;

        // 1. Fetch weather
        let weather;
        try {
            const coords = (lat && lon)
                ? { lat: Number(lat), lon: Number(lon) }
                : getCoordinatesForCity(city || '') || { lat: 20.5937, lon: 78.9629 };
            weather = await fetchWeatherData(coords.lat, coords.lon);
        } catch {
            weather = getMockWeatherSummary();
        }

        // 2. Soil
        const soilProfile = getSoilProfile(state);
        const soilScore = getSoilHealthScore(state, crop);
        const cropSuitability = getCropSuitability(state, crop);

        // 3. Price
        const priceTrend = getCropPriceTrend(crop);
        const seasonalGuidance = getSeasonalHarvestGuidance(crop, currentMonth);
        const msp = getMSP(crop);

        // 4. Mandis
        const rankedMandis = getMandisForState(state);
        const bestMandi = rankedMandis[0];

        // 5. Try Gemini AI — always fall back gracefully
        const prompt = `You are KisanAI, an expert agricultural advisor for Indian farmers.

FARMER CONTEXT: Crop=${crop}, State=${state}, City=${city || 'unknown'}, Month=${currentMonth}

WEATHER DATA (Open-Meteo, next 7 days):
- Harvest Window Score: ${weather.harvestWindowScore}/100 (${weather.harvestWindowLabel})
- Rain days next 7: ${weather.rainDaysNext7}, Avg humidity: ${weather.avgHumidityNext7}%, Max temp: ${weather.maxTempNext7}°C
- Forecast: ${weather.forecast.slice(0, 5).map((d: { dayLabel: string; tempMax: number; rain: number; humidity: number }) => `${d.dayLabel}: ${d.tempMax}°C, ${d.rain}mm rain`).join(' | ')}

SOIL (ICAR ${state}): ${soilProfile.soilType}, pH ${soilProfile.pH}, Organic Matter: ${soilProfile.organicMatter}
Crop suitability for ${crop}: ${cropSuitability}, Health Score: ${soilScore}/100

PRICE: ${priceTrend ? `WPI ${priceTrend.direction} (${priceTrend.change > 0 ? '+' : ''}${priceTrend.change}%), ${priceTrend.insight}` : 'Data unavailable'}
Season: ${seasonalGuidance.seasonLabel}, Optimal: ${seasonalGuidance.isOptimalSeason}
${msp ? `MSP: ₹${msp.msp} ${msp.unit}` : ''}

BEST MANDI: ${bestMandi.name} (${bestMandi.distance}km, Net ₹${bestMandi.netProfit}/q)

Respond ONLY in strict JSON format (no markdown):
{"harvestDecision":"HARVEST_NOW"|"WAIT_DAYS"|"NOT_READY","waitDays":0,"confidence":75,"plainSummary":"Simple 1-2 sentence in Hinglish","weatherReason":"2-3 sentences","priceReason":"2-3 sentences with numbers","soilReason":"1-2 sentences","actionPlan":["Step 1","Step 2","Step 3"],"bestMandiName":"${bestMandi.name}","bestMandiReason":"Why this mandi","harvestWindowEmoji":"✅"|"⏳"|"🚫","urgencyLevel":"HIGH"|"MEDIUM"|"LOW"}`;

        let recommendation;
        const aiText = await callGemini(prompt);

        if (aiText) {
            try {
                const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                recommendation = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
            } catch {
                recommendation = buildFallbackRecommendation(crop, state, weather, soilScore, cropSuitability, priceTrend, seasonalGuidance, bestMandi);
            }
        } else {
            recommendation = buildFallbackRecommendation(crop, state, weather, soilScore, cropSuitability, priceTrend, seasonalGuidance, bestMandi);
        }

        return NextResponse.json({
            success: true,
            recommendation,
            data: {
                weather: {
                    current: weather.current,
                    harvestWindowScore: weather.harvestWindowScore,
                    harvestWindowLabel: weather.harvestWindowLabel,
                    rainDaysNext7: weather.rainDaysNext7,
                    avgHumidityNext7: weather.avgHumidityNext7,
                    maxTempNext7: weather.maxTempNext7,
                    forecast: weather.forecast,
                },
                soil: { ...soilProfile, healthScore: soilScore, cropSuitability },
                price: priceTrend,
                seasonal: seasonalGuidance,
                msp,
                mandis: rankedMandis.slice(0, 4),
            },
        });

    } catch (error) {
        console.error('Harvest advisor error:', error);
        return NextResponse.json({ error: 'Failed to generate harvest recommendation', details: String(error) }, { status: 500 });
    }
}

