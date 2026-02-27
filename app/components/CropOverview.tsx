import { ChevronRight } from 'lucide-react';

interface CropStatus {
    name: string;
    statusText: string;
    progressPercent: number;
}

interface CropOverviewProps {
    crops?: CropStatus[];
}

export function CropOverview({ crops }: CropOverviewProps) {
    // Use mock data if none provided to match reference UI immediately
    const displayCrops = crops || [
        { name: 'Soybeans', statusText: 'Healthy', progressPercent: 70 },
        { name: 'Corn', statusText: 'Harvest Ready', progressPercent: 100 },
    ];

    return (
        <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-5">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-zinc-900 tracking-widest uppercase">CROP OVERVIEW</h2>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>

            <div className="space-y-5">
                {displayCrops.map((crop, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-zinc-600">{crop.name}</span>
                            <span className="text-sm font-semibold text-emerald-600">{crop.statusText}</span>
                        </div>
                        {/* Progress bar background */}
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            {/* Progress bar fill */}
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${crop.progressPercent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
