import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { city, state, crop, landSize } = body;

        if (!city || !crop) {
            return NextResponse.json({ error: 'City and Crop are required parameters' }, { status: 400 });
        }

        const weatherApiKey = process.env.WEATHERAPI_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!weatherApiKey || !geminiApiKey) {
            return NextResponse.json({ error: 'Missing necessary API keys in environment variables.' }, { status: 500 });
        }

        // 1. Fetch live weather using WeatherAPI
        const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&aqi=no`;

        let weatherData = null;
        try {
            const weatherRes = await fetch(weatherUrl);
            if (weatherRes.ok) {
                weatherData = await weatherRes.json();
            } else {
                console.warn(`WeatherAPI returned ${weatherRes.status}`);
            }
        } catch (e) {
            console.error('Failed to fetch from WeatherAPI:', e);
        }

        // Fallback weather info if API fails
        const temp = weatherData?.current?.temp_c ?? 'Unknown Data';
        const humidity = weatherData?.current?.humidity ?? 'Unknown';
        const condition = weatherData?.current?.condition?.text ?? 'Unknown conditions';
        const locationName = weatherData?.location?.name || city;

        // 2. Query Gemini for Smart Harvest Insights
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const prompt = `
You are an expert agricultural AI. Provide a highly precise, 2-sentence actionable insight regarding the "Optimal Harvest Window" and "Target Market" for a farmer.

Farm Context:
- Crop: ${crop}
- Location: ${locationName}, ${state || 'India'}
- Land Size: ${landSize || 'Unknown'} acres
- Current Live Weather: ${temp}°C, ${humidity}% humidity, ${condition}.

Analyze this specific weather pattern against the crop type to recommend exactly WHEN to harvest and WHERE they should consider selling for maximum profit, keep it very concise. Return your response in plain text without markdown formatting.
`;

        let geminiInsight = `Based on current weather (${temp}°C, ${condition}), harvest within the next 48 hours for optimal quality. Recommend selling at the nearest primary mandi to minimize transit spoilage.`;

        try {
            // Apply a strict 3-second timeout to the Gemini call
            const aiPromise = model.generateContent(prompt);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Gemini API timeout')), 3000)
            );

            const result = await Promise.race([aiPromise, timeoutPromise]) as any;
            if (result && result.response) {
                geminiInsight = result.response.text().trim() || geminiInsight;
            }
        } catch (e: any) {
            console.error('Gemini insight failed (using fast fallback):', e.message || e);
        }

        // 3. Return combined payload
        return NextResponse.json({
            weather: {
                temp_c: temp,
                humidity: humidity,
                condition: condition,
                location: locationName
            },
            insight: geminiInsight
        });

    } catch (error: any) {
        console.error('Harvest Insight API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
