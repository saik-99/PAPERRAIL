export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

interface CropData {
    top_crops_by_state: Record<string, { Crop: string; Production: number }[]>;
    crop_trends: Record<string, { year: number; production: number }[]>;
    top_crop_names: string[];
    states: string[];
}

let cachedData: CropData | null = null;

function loadData(): CropData {
    if (cachedData) return cachedData;
    const filePath = path.join(process.cwd(), 'public', 'data', 'crop_production.json');
    cachedData = JSON.parse(readFileSync(filePath, 'utf-8')) as CropData;
    return cachedData;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const crop = searchParams.get('crop');

    const data = loadData();

    // Match state name loosely (case-insensitive substring)
    let topCropsForState: { Crop: string; Production: number }[] = [];
    if (state) {
        const matchedKey = data.states.find((s) =>
            s.toLowerCase().includes(state.toLowerCase()) ||
            state.toLowerCase().includes(s.toLowerCase().split(' ')[0])
        );
        topCropsForState = matchedKey ? data.top_crops_by_state[matchedKey] ?? [] : [];
    }

    // Get trend series for a specific crop
    let cropTrend: { year: number; production: number }[] = [];
    if (crop) {
        const matchedCrop = data.top_crop_names.find((c) =>
            c.toLowerCase().includes(crop.toLowerCase()) ||
            crop.toLowerCase().includes(c.toLowerCase())
        );
        cropTrend = matchedCrop ? data.crop_trends[matchedCrop] ?? [] : [];
    }

    return NextResponse.json({
        states: data.states,
        top_crop_names: data.top_crop_names,
        top_crops_for_state: topCropsForState,
        crop_trend: cropTrend,
    });
}

