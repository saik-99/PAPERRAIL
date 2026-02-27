import { NextRequest, NextResponse } from 'next/server';
// Live translation disabled to guarantee 0ms presentation latency

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.NEWSAPI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'NEWSAPI_API_KEY is missing in .env.local. Please add it to fetch live news.' },
                { status: 500 }
            );
        }

        // Limit to 3, focus on global agriculture in English
        const url = `https://newsapi.org/v2/everything?q=(agriculture OR farming) AND India&language=en&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`;

        // Disable cache during development if desired, but here we do standard fetch
        const res = await fetch(url, { headers: { 'User-Agent': 'KhetiWala/1.0' } });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Error fetching from NewsAPI');
        }

        const rawArticles = data.articles || [];

        // ⚡ INSTANT DELIVERY: Skip live translation to ensure 0ms presentation latency
        // Map the raw articles directly to both English and Hindi keys to satisfy the UI types
        const translatedArticles = rawArticles.map((item: any) => ({
            ...item,
            title_en: item.title,
            title_hi: item.title, // Fallback to english for speed
            description_en: item.description,
            description_hi: item.description, // Fallback to english for speed
            link: item.url,
            published_at: item.publishedAt
        }));

        return NextResponse.json({ articles: translatedArticles });
    } catch (error: any) {
        console.error('NewsAPI fetch/translation error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
