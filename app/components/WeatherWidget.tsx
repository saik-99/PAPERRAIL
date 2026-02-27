import { Sun, CloudRain, Cloud, Wind, Droplets, ChevronRight } from 'lucide-react';

interface WeatherWidgetProps {
  tempC: number;
  humidity: number;
  description: string;
  location?: string;
  dateStr?: string;
}

export function WeatherWidget({
  tempC,
  humidity,
  description,
  location = 'Your Farm',
  dateStr = 'Today'
}: WeatherWidgetProps) {
  // Mock forecast for the UI to match the Agri-Sync 360 reference
  const forecast = [
    { day: 'Thu', temp: 21, icon: <Sun className="h-5 w-5 text-amber-400" /> },
    { day: 'Fri', temp: 19, icon: <CloudRain className="h-5 w-5 text-blue-400" /> },
    { day: 'Sat', temp: 23, icon: <Sun className="h-5 w-5 text-amber-400" /> },
    { day: 'Sun', temp: 20, icon: <Cloud className="h-5 w-5 text-zinc-400" /> },
    { day: 'Mon', temp: 18, icon: <Cloud className="h-5 w-5 text-zinc-400" /> },
  ];

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-5 h-full flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 tracking-widest uppercase">CURRENT WEATHER</h2>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {location} ({dateStr})
        </p>

        {/* Main Temp & Sunset */}
        <div className="flex items-center gap-4 mt-6">
          <Sun className="h-12 w-12 text-amber-500" />
          <div>
            <div className="flex items-start">
              <span className="text-5xl font-semibold text-zinc-900 tracking-tighter">{tempC}</span>
              <span className="text-2xl text-zinc-900 mt-1">°C</span>
            </div>
            <p className="text-[11px] text-zinc-500">18:42 Sunset</p>
          </div>
        </div>

        {/* Details list */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <CloudRain className="h-3.5 w-3.5" />
              <span>Precip</span>
            </div>
            <span className="text-zinc-900 font-medium">0%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <Droplets className="h-3.5 w-3.5" />
              <span>Humidity</span>
            </div>
            <span className="text-zinc-900 font-medium">{humidity}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <Wind className="h-3.5 w-3.5" />
              <span>Wind</span>
            </div>
            <span className="text-zinc-900 font-medium">12 km/h SSE</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Strip */}
      <div className="mt-8 flex items-center justify-between pt-4 border-t border-zinc-100">
        {forecast.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-medium">{f.day}</span>
            {f.icon}
            <span className="text-xs text-zinc-900 font-semibold">{f.temp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
