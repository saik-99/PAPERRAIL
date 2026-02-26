export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

interface WPIRecord {
    commodity: string;
    weight: number | null;
    series: { month: string; index: number }[];
}

let cachedData: WPIRecord[] | null = null;

function loadData(): WPIRecord[] {
    if (cachedData) return cachedData;
    const filePath = path.join(process.cwd(), 'public', 'data', 'wpi_summary.json');
    cachedData = JSON.parse(readFileSync(filePath, 'utf-8')) as WPIRecord[];
    return cachedData;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() ?? '';

    const data = loadData();

    // Filter by commodity name if query is provided
    const filtered = query
        ? data.filter((r) => r.commodity.toLowerCase().includes(query))
        : data.slice(0, 50); // return first 50 if no filter

    return NextResponse.json({
        total: filtered.length,
        commodities: filtered.map((r) => ({
            name: r.commodity,
            weight: r.weight,
            series: r.series.slice(-12), // last 12 months for chart
        })),
    });
}

