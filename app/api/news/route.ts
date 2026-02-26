import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-static';

async function translateToHindi(text: string): Promise<string> {
    if (!text) return '';
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return text;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent(`Translate the following English agriculture news text precisely into simple Hindi. Return ONLY the translated Hindi text, nothing else.\n\nText: ${text}`);
        return result.response.text().trim() || text;
    } catch (e) {
        console.error('Translation failed:', e);
        return text; // fallback to English if translation fails
    }
}

export async function GET() {
    try {
        const apiKey = process.env.APITUBE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'APITUBE_API_KEY is missing in .env.local. Please add it to fetch live news.' },
                { status: 500 }
            );
        }

        // Limit to 3, focus on India or global agriculture
        const url = `https://api.apitube.io/v1/news/everything?api_key=${apiKey}&q=agriculture+OR+farming+AND+india&language=en&limit=3`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Error fetching from APITube');
        }

        const rawArticles = data.results || data.articles || [];

        // Translate titles and descriptions
        const translatedArticles = await Promise.all(rawArticles.map(async (item: any) => {
            const title_hi = await translateToHindi(item.title);
            const description_hi = item.description ? await translateToHindi(item.description.substring(0, 300)) : '';

            return {
                ...item,
                title_en: item.title,
                title_hi: title_hi,
                description_en: item.description,
                description_hi: description_hi,
                link: item.url || item.link // Ensure standard link format
            };
        }));

        return NextResponse.json({ articles: translatedArticles });
    } catch (error: any) {
        console.error('APITube fetch/translation error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
