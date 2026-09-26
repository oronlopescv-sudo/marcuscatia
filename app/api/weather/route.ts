import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Live weather for Mindelo from Open-Meteo (free, no API key).
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=16.8866&longitude=-24.9956' +
  '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day' +
  '&timezone=Atlantic%2FCape_Verde';

const CACHE_TTL_MS = 15 * 60 * 1000;
let cached: { body: Record<string, unknown>; timestamp: number } | null = null;

type Current = {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weather_code: number;
};

// WMO weather codes → text and the widget's icon type
function describe(code: number, wind: number): { condition: string; iconType: string } {
  if (code === 0) return { condition: wind >= 30 ? 'Clear and windy' : 'Clear sky', iconType: wind >= 30 ? 'windy' : 'sunny' };
  if (code <= 2) return { condition: 'Partly cloudy', iconType: 'partly-cloudy' };
  if (code === 3) return { condition: 'Overcast', iconType: 'cloudy' };
  if (code === 45 || code === 48) return { condition: 'Hazy', iconType: 'cloudy' };
  if (code >= 51 && code <= 67) return { condition: 'Light rain', iconType: 'rainy' };
  if (code >= 80 && code <= 82) return { condition: 'Rain showers', iconType: 'rainy' };
  if (code >= 95) return { condition: 'Thunderstorms', iconType: 'rainy' };
  return { condition: 'Mixed weather', iconType: 'partly-cloudy' };
}

function compass(deg: number): string {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
}

function tip(temp: number, iconType: string): string {
  if (iconType === 'rainy') return 'A rare rainy day in Mindelo — bring a light jacket for the walk to the market.';
  if (temp >= 28) return 'Hot day in Mindelo: wear light clothes, a hat and bring water for the market tour.';
  if (iconType === 'windy') return 'Windy day on the bay — hold on to your hat at the fish market!';
  return 'Pleasant weather in Mindelo for cooking! Bring comfortable clothes and enjoy the ocean breeze.';
}

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.body, cached: true });
  }

  try {
    const res = await fetch(URL, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    const current = (await res.json()).current as Current;

    const temp = Math.round(current.temperature_2m);
    const wind = Math.round(current.wind_speed_10m);
    const { condition, iconType } = describe(current.weather_code, wind);

    const body = {
      weather: {
        temperature: `${temp}°C`,
        condition,
        conditionEnglish: condition,
        wind: `${wind} km/h ${compass(current.wind_direction_10m)}`,
        humidity: `${Math.round(current.relative_humidity_2m)}%`,
        iconType,
        studentTip: tip(temp, iconType),
        comfortLevel: temp >= 28 ? 'Hot — stay in the shade between activities.' : 'Warm and comfortable, ideal for the market walk.',
      },
      sources: [{ title: 'Open-Meteo', url: 'https://open-meteo.com' }],
      timestamp: now,
    };
    cached = { body, timestamp: now };
    return NextResponse.json({ ...body, cached: false });
  } catch (error) {
    console.error('Weather fetch failed:', error);
    // Last known reading if we have one; otherwise no weather (the widget shows "—").
    if (cached) return NextResponse.json({ ...cached.body, cached: true });
    return NextResponse.json({ weather: null, sources: [], error: 'Weather unavailable' });
  }
}
