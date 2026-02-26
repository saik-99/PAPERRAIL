export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData, getMockWeatherSummary, getCoordinatesForCity } from '@/lib/weatherUtils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  try {
    let coords: { lat: number; lon: number };

    if (lat && lon) {
      coords = { lat: Number(lat), lon: Number(lon) };
    } else if (city) {
      const found = getCoordinatesForCity(city);
      coords = found ?? { lat: 21.1458, lon: 79.0882 }; // Nagpur fallback
    } else {
      coords = { lat: 21.1458, lon: 79.0882 };
    }

    const weather = await fetchWeatherData(coords.lat, coords.lon);

    return NextResponse.json({
      success: true,
      source: 'open-meteo',
      weather: {
        temp: weather.current.temp,
        humidity: weather.current.humidity,
        windSpeed: weather.current.windSpeed,
        description: weather.current.weatherLabel,
        harvestWindowScore: weather.harvestWindowScore,
        harvestWindowLabel: weather.harvestWindowLabel,
        rainDaysNext7: weather.rainDaysNext7,
        avgHumidityNext7: weather.avgHumidityNext7,
        forecast: weather.forecast.map(d => ({
          day: d.dayLabel,
          temp: d.tempMax,
          humidity: d.humidity,
          rain: d.rain > 1,
          rainMm: d.rain,
          weatherLabel: d.weatherLabel,
          harvestRisk: d.harvestRisk,
        })),
      },
    });
  } catch (error) {
    console.error('Weather fetch failed, using mock:', error);
    const mock = getMockWeatherSummary();
    return NextResponse.json({
      success: true,
      source: 'mock-fallback',
      weather: {
        temp: mock.current.temp,
        humidity: mock.current.humidity,
        description: mock.current.weatherLabel,
        harvestWindowScore: mock.harvestWindowScore,
        harvestWindowLabel: mock.harvestWindowLabel,
        rainDaysNext7: mock.rainDaysNext7,
        forecast: mock.forecast.map(d => ({
          day: d.dayLabel,
          temp: d.tempMax,
          humidity: d.humidity,
          rain: d.rain > 1,
          rainMm: d.rain,
          weatherLabel: d.weatherLabel,
          harvestRisk: d.harvestRisk,
        })),
      },
    });
  }
}

