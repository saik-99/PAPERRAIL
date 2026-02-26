'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceChartProps {
    data: any[];
    isRising: boolean;
}

export function PriceChart({ data, isRising }: PriceChartProps) {
    const color = isRising ? "#059669" : "#ef4444"; // emerald-600 or red-500
    const gradientId = isRising ? "colorGreen" : "colorRed";

    return (
        <div className="h-40 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2d1a" />
                    <Tooltip
                        contentStyle={{ background: '#0d1a0d', border: '1px solid #1a2d1a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`₹${Number(value).toFixed(0)}/Q`, 'Price']}
                        labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
