import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat') || '21.1458'
  const lon = searchParams.get('lon') || '79.0882'

  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey || apiKey === 'your_openweathermap_api_key') {
    // Return mock weather data if API key not set
    return NextResponse.json({
      success: true,
      weather: {
        temp: 28,
        humidity: 72,
        description: 'Partly cloudy',
        forecast: [
          { day: 'Today', temp: 28, humidity: 72, rain: false },
          { day: 'Tomorrow', temp: 30, humidity: 68, rain: false },
          { day: 'Day 3', temp: 29, humidity: 75, rain: true },
          { day: 'Day 4', temp: 27, humidity: 80, rain: true },
          { day: 'Day 5', temp: 26, humidity: 70, rain: false },
        ]
      }
    })
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=5`
    )
    const data = await res.json()
    return NextResponse.json({ success: true, weather: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Weather fetch failed' }, { status: 500 })
  }
}
