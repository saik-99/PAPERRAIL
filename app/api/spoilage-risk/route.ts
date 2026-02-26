import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
            return null;
        }
    }
    return null;
}

// Smart crop-specific fallback assessment
function buildFallbackAssessment(
    crop: string, humidity: number, temp: number,
    transitDays: number, storageType: string
) {
    const score = Math.round((humidity / 100) * 40 + (transitDays / 14) * 35 + (temp / 45) * 25);
    const riskScore = Math.min(100, score);
    const riskLabel = riskScore < 35 ? 'LOW' : riskScore < 65 ? 'MEDIUM' : 'HIGH';
    const riskColor = riskScore < 35 ? '#22c55e' : riskScore < 65 ? '#f59e0b' : '#ef4444';

    const actions = [
        {
            action: 'Sun Drying',
            method: 'Natural moisture reduction',
            cost: 'Free',
            costAmount: '₹0 — Bilkul free',
            effectiveness: 'High',
            timeToAct: 'Abhi karein agar dhoop hai',
            steps: [
                'Saaf tarpaulin par fasal phailaiye',
                'Har 2 ghante mein palat dein',
                'Shaam se pehle andar le aayein',
                'Jab tak nami 12% se kam na ho, repeat karein',
            ],
            whyItWorks: 'Nami kam karne se fungal growth ruk jaati hai — yeh sabse badi spoilage wajah hoti hai.',
        },
        {
            action: 'HDPE Poly Bag Sealing',
            method: 'Airtight storage',
            cost: 'Low',
            costAmount: '₹50-200 per quintal',
            effectiveness: 'High',
            timeToAct: 'Sun drying ke baad',
            steps: [
                'Double-layer HDPE bags use karein',
                '90% capacity tak bharein',
                'Rope se tightly band karein',
                'Seedhe zameen par nahi — pallet par rakhein',
            ],
            whyItWorks: 'Airtight seal se bahar ki nami andar nahi aa sakti aur keede bhi nahi aate.',
        },
        {
            action: 'Neem Leaf Treatment',
            method: 'Natural pest deterrent',
            cost: 'Free',
            costAmount: '₹0 — Jugaad solution',
            effectiveness: 'Medium',
            timeToAct: 'Storage se pehle',
            steps: [
                'Sukhi neem ki pattiyan collect karein',
                'Har bori mein 1 mutthi pattiyan daalen',
                'Top aur bottom dono taraf rakhein',
                'Har 15 din mein check karein',
            ],
            whyItWorks: 'Neem mein azadirachtin hoti hai jo naturally keedo ko door rakhti hai — chemicals ki zaroorat nahi.',
        },
        {
            action: 'Cold Storage',
            method: 'Temperature-controlled godown',
            cost: 'Medium',
            costAmount: '₹200-500 per quintal per month',
            effectiveness: 'High',
            timeToAct: '24 ghanton ke andar',
            steps: [
                'Nearest cold storage ka number pathshala/mandi se lein',
                'Covered vehicle mein transport karein',
                '4-8°C temperature maintain karein',
                'Har 2 hafte mein quality check karein',
            ],
            whyItWorks: 'Kam temperature mein bacteria aur enzyme activity kaafi slow ho jaati hai — fasal zyada dino tak fresh rehti hai.',
        },
        {
            action: 'Warehouse Receipt (WDRA)',
            method: 'Collateral-based storage',
            cost: 'Medium',
            costAmount: '₹150-400 per quintal per month + loan facility',
            effectiveness: 'High',
            timeToAct: 'Jab price low ho aur aaj bechna nahi chahte',
            steps: [
                'WDRA registered warehouse dhundein',
                'Fasal quality test karwaiye',
                'Receipt le lein — isse loan bhi mil sakta hai',
                'Market rate theek hone par bechein',
            ],
            whyItWorks: 'Fasal safe storage mein rehti hai aur aap warehouse receipt pe bank se loan le sakte hain cash emergency mein.',
        },
    ];

    const immediateActions = [];
    if (humidity > 75) {
        immediateActions.push('🔴 ABHI KAREIN: Nami bahut zyada hai — seedhe covered godown mein le jaiye. Open mein mat rakhein.');
    }
    if (temp > 38) {
        immediateActions.push('🔴 24 ghanton mein: Itni garmi mein fasal jaldi kharab hoti hai. Chhanv wali jagah move karein ya cold storage contact karein.');
    }
    if (transitDays > 5) {
        immediateActions.push('🟡 Transport se pehle: ' + transitDays + ' din bahut zyada hai perishable crops ke liye. Kya koi zyada paas ka mandi hai?');
    }
    if (immediateActions.length === 0) {
        immediateActions.push(
            '🟢 Conditions theek hain abhi. Regular monitoring karein.',
            '💡 24 ghanton mein ek baar nami check karein — agar clumping ho toh risk badh raha hai.'
        );
    }

    return {
        riskScore,
        riskLabel,
        riskColor,
        plainRisk: `${crop} ke liye abhi ${riskLabel} risk hai. Humidity ${humidity}%, temperature ${temp}°C aur ${transitDays} din transit ke hisaab se is score ka aaklan kiya gaya.`,
        keyRiskFactors: [
            humidity > 70 ? `⚠️ High humidity (${humidity}%) — fungal infection ka khatre` : `✅ Humidity (${humidity}%) theek hai`,
            temp > 35 ? `⚠️ Garmi (${temp}°C) — spoilage 3x fast hoti hai` : `✅ Temperature (${temp}°C) acceptable hai`,
            transitDays > 5 ? `⚠️ ${transitDays} din transit — perishables ke liye risky` : `✅ Transit (${transitDays} din) manageable hai`,
            storageType.includes('Open') ? '⚠️ Open storage — nami aur keedo ka exposure' : `✅ ${storageType} — accha storage method`,
        ],
        estimatedLossPercent: Math.round(riskScore / 7),
        preservationActions: actions,
        immediateActions,
        weatherWarning: humidity > 75
            ? 'HIGH ALERT: 75%+ humidity mein fungal infection 48 ghante mein shuru ho sakta hai. Turant action lein.'
            : temp > 38
                ? 'Garmi se spoilage rate 3x ho jaati hai. Chhanv ya cool storage priority hai.'
                : 'Conditions abhi manageable hain. Regular monitoring zaroor karein.',
        cropSpecificTips: [
            `${crop} ke liye ideal storage nami: 10-12%`,
            'Har bori par harvest date likhein — FIFO (pehle aaya pehle jaaye) follow karein',
            'Kisan suvidha app download karein — free storage weather alerts milti hain',
        ],
        safeStorageDays: Math.max(7, Math.round(45 - (riskScore * 0.35))),
        qualityImpactTimeline: [
            { day: 1, quality: 100, label: 'Harvest fresh' },
            { day: 3, quality: riskScore > 65 ? 90 : 97, label: 'Minor change' },
            { day: 7, quality: riskScore > 65 ? 75 : 90, label: 'Risk builds' },
            { day: 14, quality: riskScore > 65 ? 55 : 78, label: 'Significant risk' },
            { day: 21, quality: riskScore > 65 ? 35 : 62, label: 'Major spoilage risk' },
        ],
    };
}

export async function POST(req: NextRequest) {
    try {
        const {
            crop = 'Wheat',
            humidity = 65,
            temp = 30,
            transitDays = 3,
            storageType = 'Open warehouse',
            state = 'Not specified',
        } = await req.json();

        const prompt = `You are a post-harvest expert for Indian agriculture.
Crop: ${crop}, Humidity: ${humidity}%, Temperature: ${temp}°C, Transit: ${transitDays} days, Storage: ${storageType}, Region: ${state}

Assess spoilage risk and rank preservation actions by cost. Respond ONLY in this JSON (no markdown):
{"riskScore":45,"riskLabel":"MEDIUM","riskColor":"#f59e0b","plainRisk":"Simple Hinglish sentence","keyRiskFactors":["factor 1","factor 2","factor 3"],"estimatedLossPercent":8,"preservationActions":[{"action":"Name","method":"Method","cost":"Free|Low|Medium|High","costAmount":"₹0-200/q","effectiveness":"High|Medium|Low","timeToAct":"When","steps":["Step 1","Step 2"],"whyItWorks":"Science explanation"}],"immediateActions":["Do NOW: ...","Within 24hr: ..."],"weatherWarning":"Warning text","cropSpecificTips":["Tip 1"],"safeStorageDays":15,"qualityImpactTimeline":[{"day":1,"quality":100,"label":"Fresh"},{"day":7,"quality":85,"label":"Declining"},{"day":14,"quality":70,"label":"At risk"},{"day":21,"quality":55,"label":"Major loss"}]}

Rules: at least 4 preservation actions ranked cheapest first. Use simple Hindi/English.`;

        const aiText = await callGemini(prompt);
        let assessment;

        if (aiText) {
            try {
                const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                assessment = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
            } catch {
                assessment = buildFallbackAssessment(crop, humidity, temp, transitDays, storageType);
            }
        } else {
            assessment = buildFallbackAssessment(crop, humidity, temp, transitDays, storageType);
        }

        return NextResponse.json({ success: true, assessment });

    } catch (error) {
        console.error('Spoilage risk error:', error);
        // Even total failure — return usable data
        const body = await req.json().catch(() => ({}));
        const assessment = buildFallbackAssessment(
            body.crop || 'Wheat', body.humidity || 65,
            body.temp || 30, body.transitDays || 3, body.storageType || 'Open warehouse'
        );
        return NextResponse.json({ success: true, assessment });
    }
}
