// Weather utilities using Open-Meteo API (free, no API key required)
// Docs: https://open-meteo.com/en/docs

export interface DayForecast {
    date: string;         // YYYY-MM-DD
    dayLabel: string;     // "Today", "Tomorrow", "Thu 27 Feb"
    tempMax: number;      // °C
    tempMin: number;      // °C
    humidity: number;     // %
    rain: number;         // mm precipiation
    windSpeed: number;    // km/h
    weatherCode: number;  // WMO code
    weatherLabel: string; // human-readable
    harvestRisk: 'Low' | 'Medium' | 'High';
}

export interface WeatherSummary {
    current: {
        temp: number;
        humidity: number;
        windSpeed: number;
        weatherLabel: string;
        weatherCode: number;
    };
    forecast: DayForecast[];
    harvestWindowScore: number; // 0-100, higher = better time to harvest
    harvestWindowLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    rainDaysNext7: number;
    avgHumidityNext7: number;
    maxTempNext7: number;
}

function getWeatherLabel(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 9) return 'Overcast';
    if (code <= 19) return 'Foggy';
    if (code <= 29) return 'Light drizzle';
    if (code <= 39) return 'Drizzle';
    if (code <= 49) return 'Freezing drizzle';
    if (code <= 59) return 'Light rain';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    if (code <= 84) return 'Rain showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
}

function computeHarvestRisk(rain: number, tempMax: number, humidity: number): 'Low' | 'Medium' | 'High' {
    if (rain > 10 || humidity > 80 || tempMax > 40) return 'High';
    if (rain > 3 || humidity > 70 || tempMax > 37) return 'Medium';
    return 'Low';
}

function computeHarvestWindowScore(forecast: DayForecast[]): { score: number; label: 'Excellent' | 'Good' | 'Fair' | 'Poor' } {
    if (forecast.length === 0) return { score: 50, label: 'Fair' };

    let score = 100;
    const next5 = forecast.slice(0, 5);

    for (const day of next5) {
        if (day.rain > 15) score -= 25;
        else if (day.rain > 5) score -= 12;
        else if (day.rain > 1) score -= 5;

        if (day.humidity > 80) score -= 15;
        else if (day.humidity > 70) score -= 7;

        if (day.tempMax > 42) score -= 10;
        else if (day.tempMax > 38) score -= 5;

        if (day.weatherCode >= 61) score -= 10; // Rain codes
        if (day.weatherCode >= 95) score -= 20; // Thunder codes
    }

    score = Math.max(0, Math.min(100, score));
    const label: 'Excellent' | 'Good' | 'Fair' | 'Poor' =
        score >= 75 ? 'Excellent' : score >= 55 ? 'Good' : score >= 35 ? 'Fair' : 'Poor';

    return { score, label };
}

function formatDayLabel(dateStr: string, index: number): string {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherSummary> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,wind_speed_10m_max,weather_code');
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
    url.searchParams.set('timezone', 'Asia/Kolkata');
    url.searchParams.set('forecast_days', '7');

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } }); // Cache 30 min
    if (!res.ok) throw new Error(`Open-Meteo API failed: ${res.status}`);

    const data = await res.json();

    const current = {
        temp: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherLabel: getWeatherLabel(data.current.weather_code),
        weatherCode: data.current.weather_code,
    };

    const forecast: DayForecast[] = data.daily.time.map((date: string, i: number) => {
        const tempMax = Math.round(data.daily.temperature_2m_max[i]);
        const tempMin = Math.round(data.daily.temperature_2m_min[i]);
        const humidity = data.daily.relative_humidity_2m_max[i];
        const rain = Math.round((data.daily.precipitation_sum[i] || 0) * 10) / 10;
        const windSpeed = Math.round(data.daily.wind_speed_10m_max[i]);
        const weatherCode = data.daily.weather_code[i];

        return {
            date,
            dayLabel: formatDayLabel(date, i),
            tempMax,
            tempMin,
            humidity,
            rain,
            windSpeed,
            weatherCode,
            weatherLabel: getWeatherLabel(weatherCode),
            harvestRisk: computeHarvestRisk(rain, tempMax, humidity),
        };
    });

    const { score, label } = computeHarvestWindowScore(forecast);
    const rainDaysNext7 = forecast.filter(d => d.rain > 1).length;
    const avgHumidityNext7 = Math.round(forecast.reduce((s, d) => s + d.humidity, 0) / forecast.length);
    const maxTempNext7 = Math.max(...forecast.map(d => d.tempMax));

    return {
        current,
        forecast,
        harvestWindowScore: score,
        harvestWindowLabel: label,
        rainDaysNext7,
        avgHumidityNext7,
        maxTempNext7,
    };
}

// City to lat/lon lookup for common Indian agricultural cities
export const CITY_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
    'Ludhiana': { lat: 30.901, lon: 75.857, state: 'Punjab' },
    'Amritsar': { lat: 31.634, lon: 74.872, state: 'Punjab' },
    'Chandigarh': { lat: 30.733, lon: 76.779, state: 'Punjab' },
    'Jalandhar': { lat: 31.326, lon: 75.576, state: 'Punjab' },
    'Delhi': { lat: 28.6139, lon: 77.209, state: 'Delhi' },
    'Karnal': { lat: 29.686, lon: 76.990, state: 'Haryana' },
    'Hisar': { lat: 29.151, lon: 75.722, state: 'Haryana' },
    'Rohtak': { lat: 28.895, lon: 76.577, state: 'Haryana' },
    'Agra': { lat: 27.176, lon: 78.008, state: 'Uttar Pradesh' },
    'Lucknow': { lat: 26.847, lon: 80.947, state: 'Uttar Pradesh' },
    'Varanasi': { lat: 25.317, lon: 82.974, state: 'Uttar Pradesh' },
    'Kanpur': { lat: 26.449, lon: 80.331, state: 'Uttar Pradesh' },
    'Nagpur': { lat: 21.145, lon: 79.089, state: 'Maharashtra' },
    'Pune': { lat: 18.520, lon: 73.857, state: 'Maharashtra' },
    'Nashik': { lat: 19.997, lon: 73.791, state: 'Maharashtra' },
    'Aurangabad': { lat: 19.876, lon: 75.343, state: 'Maharashtra' },
    'Indore': { lat: 22.720, lon: 75.858, state: 'Madhya Pradesh' },
    'Bhopal': { lat: 23.259, lon: 77.412, state: 'Madhya Pradesh' },
    'Ujjain': { lat: 23.179, lon: 75.785, state: 'Madhya Pradesh' },
    'Ahmedabad': { lat: 23.023, lon: 72.572, state: 'Gujarat' },
    'Surat': { lat: 21.170, lon: 72.831, state: 'Gujarat' },
    'Rajkot': { lat: 22.303, lon: 70.802, state: 'Gujarat' },
    'Jaipur': { lat: 26.913, lon: 75.787, state: 'Rajasthan' },
    'Jodhpur': { lat: 26.295, lon: 73.017, state: 'Rajasthan' },
    'Kota': { lat: 25.183, lon: 75.843, state: 'Rajasthan' },
    'Bengaluru': { lat: 12.971, lon: 77.594, state: 'Karnataka' },
    'Mysuru': { lat: 12.295, lon: 76.645, state: 'Karnataka' },
    'Hubli': { lat: 15.362, lon: 75.124, state: 'Karnataka' },
    'Hyderabad': { lat: 17.385, lon: 78.486, state: 'Andhra Pradesh' },
    'Vijayawada': { lat: 16.506, lon: 80.648, state: 'Andhra Pradesh' },
    'Chennai': { lat: 13.083, lon: 80.270, state: 'Tamil Nadu' },
    'Coimbatore': { lat: 11.017, lon: 76.966, state: 'Tamil Nadu' },
    'Kolkata': { lat: 22.572, lon: 88.364, state: 'West Bengal' },
    'Patna': { lat: 25.594, lon: 85.138, state: 'Bihar' },
    'Raipur': { lat: 21.252, lon: 81.630, state: 'Chhattisgarh' },
    'Bhubaneswar': { lat: 20.296, lon: 85.825, state: 'Odisha' },
    'Thiruvananthapuram': { lat: 8.524, lon: 76.937, state: 'Kerala' },
    'Kochi': { lat: 9.932, lon: 76.267, state: 'Kerala' },
    'Shimla': { lat: 31.104, lon: 77.173, state: 'Himachal Pradesh' },
};

export function getCoordinatesForCity(city: string): { lat: number; lon: number } | null {
    const match = Object.entries(CITY_COORDINATES).find(
        ([name]) => name.toLowerCase() === city.toLowerCase() || city.toLowerCase().includes(name.toLowerCase())
    );
    return match ? { lat: match[1].lat, lon: match[1].lon } : null;
}

// Fallback mock weather (used when Open-Meteo is unavailable — e.g., dev mode)
export function getMockWeatherSummary(): WeatherSummary {
    const today = new Date();
    const forecast: DayForecast[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const rain = i === 2 ? 8 : i === 5 ? 15 : 0;
        const tempMax = 28 + Math.sin(i) * 3;
        const humidity = 65 + i * 2;
        return {
            date: dateStr,
            dayLabel: formatDayLabel(dateStr, i),
            tempMax: Math.round(tempMax),
            tempMin: Math.round(tempMax - 8),
            humidity,
            rain,
            windSpeed: 12,
            weatherCode: rain > 5 ? 61 : 1,
            weatherLabel: rain > 5 ? 'Light rain' : 'Partly cloudy',
            harvestRisk: computeHarvestRisk(rain, Math.round(tempMax), humidity),
        };
    });

    const { score, label } = computeHarvestWindowScore(forecast);

    return {
        current: { temp: 28, humidity: 65, windSpeed: 12, weatherLabel: 'Partly cloudy', weatherCode: 1 },
        forecast,
        harvestWindowScore: score,
        harvestWindowLabel: label,
        rainDaysNext7: forecast.filter(d => d.rain > 1).length,
        avgHumidityNext7: Math.round(forecast.reduce((s, d) => s + d.humidity, 0) / 7),
        maxTempNext7: Math.max(...forecast.map(d => d.tempMax)),
    };
}
