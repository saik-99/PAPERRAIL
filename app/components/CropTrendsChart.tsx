import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';

interface ChartPoint {
    date: string;
    corn?: number;
    soybeans?: number;
    wheat?: number;
}

interface CropTrendsChartProps {
    data?: ChartPoint[];
}

export function CropTrendsChart({ data }: CropTrendsChartProps) {
    // Use mock overlapping data to match the UI if none provided
    const displayData = data || [
        { date: 'Oct 19', corn: 4, soybeans: 6.5, wheat: 4.8 },
        { date: 'Oct 20', corn: 5.5, soybeans: 8.5, wheat: 4.5 },
        { date: 'Oct 21', corn: 9.5, soybeans: 6.0, wheat: 6.5 },
        { date: 'Oct 22', corn: 6.8, soybeans: 8.2, wheat: 4.9 },
        { date: 'Oct 23', corn: 4.5, soybeans: 11.8, wheat: 7.8 },
        { date: 'Oct 24', corn: 2.5, soybeans: 7.5, wheat: 3.9 },
        { date: 'Oct 25', corn: 6.0, soybeans: 9.0, wheat: 6.0 },
        { date: 'Oct 26', corn: 4.5, soybeans: 13.15, wheat: 6.8 },
    ];

    return (
        <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-sm font-bold text-zinc-900 tracking-widest uppercase">CROP PRICES TRENDS</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Price (₹/Quintal)</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors">
                    Last 7 Days
                    <ChevronDown className="h-3 w-3" />
                </button>
            </div>

            <div className="flex-1 min-h-[260px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSoybeans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#71717a' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#71717a' }}
                        />
                        <Tooltip
                            contentStyle={{ background: '#ffffff', border: '1px solid #d1fae5', borderRadius: '8px', color: '#18181b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#18181b', fontSize: '12px', fontWeight: 500 }}
                            labelStyle={{ display: 'none' }}
                        />

                        {/* Wheat (Amber line instead of white against white bg) */}
                        <Area
                            type="monotone"
                            dataKey="wheat"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="transparent"
                            dot={false}
                            activeDot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff' }}
                        />

                        {/* Corn (Dark Green) */}
                        <Area
                            type="monotone"
                            dataKey="corn"
                            stroke="#065f46"
                            strokeWidth={2}
                            fill="transparent"
                            dot={false}
                            activeDot={{ r: 4, fill: '#065f46', stroke: '#ffffff' }}
                        />

                        {/* Soybeans (Bright glowing Green) */}
                        <Area
                            type="monotone"
                            dataKey="soybeans"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorSoybeans)"
                            dot={false}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Floating Custom Tooltip Overlays */}
                <div className="absolute top-[8%] right-[8%] bg-white border border-emerald-200 rounded-lg p-2 shadow-lg z-10">
                    <p className="text-[10px] text-zinc-500">Oct 26</p>
                    <p className="text-xs text-emerald-600 font-medium">Soybeans</p>
                    <p className="text-sm text-zinc-900 font-bold">₹13,150</p>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm bg-[#065f46]" />
                    <span className="text-xs text-zinc-600 font-medium">Corn</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm bg-[#10b981]" />
                    <span className="text-xs text-zinc-600 font-medium">Soybeans</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
                    <span className="text-xs text-zinc-600 font-medium">Wheat</span>
                </div>
            </div>
        </div>
    );
}
