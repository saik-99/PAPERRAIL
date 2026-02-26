export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Try multiple model names in case one is unavailable
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro'];

async function tryGemini(prompt: string, context: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([{ text: context }, { text: prompt }]);
            return result.response.text();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes('404') || msg.includes('not found') || msg.includes('not supported')) {
                continue; // try next model
            }
            throw e; // real error, stop
        }
    }
    return null;
}

// Smart fallback responses based on common questions
function getFallbackReply(message: string, context: { crop?: string; state?: string }): string {
    const msg = message.toLowerCase();
    const crop = context?.crop || 'aapki fasal';
    const state = context?.state || 'aapke kshetra';

    if (msg.includes('bechna') || msg.includes('sell') || msg.includes('price') || msg.includes('rate')) {
        return `${crop} ke liye abhi market mein acche rate chal rahe hain ${state} mein. Apne nearest APMC mandi mein aaj ka rate check karein aur MSP se compare karein. Agar rate MSP se kam hai toh FCI procurement center try karein. 💡 Tip: Mangalwar aur Budhwar ko mandi mein behtar rate milte hain.`;
    }
    if (msg.includes('mausam') || msg.includes('weather') || msg.includes('rain') || msg.includes('barish')) {
        return `Agle kuch dinon mein ${state} mein baarish ka khatre hai. Apni kaati hui fasal ko tarapulin se dhak dein. Agar nami zyada ho toh jute ki boriyon mein mat rakhein — HDPE bags use karein. 💡 Tip: Mosam kharab hone se pehle fasal godown mein shift karein.`;
    }
    if (msg.includes('storage') || msg.includes('store') || msg.includes('rakhna') || msg.includes('godam')) {
        return `${crop} ko store karne ke liye: 1) Pehle sun-dry karein jab tak moisture 12% se kam na ho. 2) HDPE poly bags mein band karein. 3) Zameen se upar rakkhein — seedha zameen par mat rakhein. 💡 Tip: Neem ki patti bag mein daalne se keede nahi aate — bilkul free jugaad!`;
    }
    if (msg.includes('scheme') || msg.includes('yojana') || msg.includes('government') || msg.includes('sarkar')) {
        return `Aapke liye kuch important sarkari yojanaen: 1) PM-KISAN: ₹6000/saal direct bank mein. 2) Fasal Bima Yojana: Fasal kharab hone par insurance. 3) eNAM: Online mandi mein seedha bechein, broker nahi. 💡 Tip: PM-KISAN ke liye pmkisan.gov.in par register karein — bilkul free hai.`;
    }
    if (msg.includes('pest') || msg.includes('keeda') || msg.includes('rog') || msg.includes('disease')) {
        return `${crop} mein keede ya bimari ke symptoms dekh rahe hain? Pehle ek local Krishi Vigyan Kendra (KVK) se contact karein — free expert advice milti hai. Sab se pehle prabhavit parts ko alag kar dein. 💡 Tip: Kisan Call Center 1800-180-1551 par call karein — bilkul toll-free hai, seedha expert se baat kar sakte hain.`;
    }
    // Generic response
    return `${crop} ke baare mein aapka sawaal samajh aaya. ${state} mein is samay behtar planning ke liye: apni fasal ki quality check karein, nearest mandi ka rate dekhen, aur agar storage ki zaroorat hai toh sahi nami (12% se kam) ensure karein. 💡 Tip: Kisan Call Center 1800-180-1551 par kabhi bhi expert se baat kar sakte hain — bilkul muft.`;
}

export async function POST(req: NextRequest) {
    try {
        const { message, context } = await req.json();

        const systemContext = `You are KhetiWala AI, an expert agricultural advisor for Indian farmers. Speak in simple Hinglish (Hindi + English mix).
Farmer: State=${context?.state || 'India'}, Crop=${context?.crop || 'general'}, City=${context?.city || 'unknown'}.
Give 3-4 sentence practical advice. Always end with one actionable tip starting with "💡 Tip:".`;

        const reply = await tryGemini(`Farmer's question: ${message}`, systemContext);

        if (reply) {
            return NextResponse.json({ reply });
        }

        // Smart fallback — never shows error to user
        return NextResponse.json({ reply: getFallbackReply(message, context) });

    } catch (error) {
        console.error('Gemini API error:', error);
        // Even on total failure — return a helpful response, not an error
        const { message, context } = await req.json().catch(() => ({ message: '', context: {} }));
        return NextResponse.json({ reply: getFallbackReply(message || '', context || {}) });
    }
}

