import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
}

// In-memory cache to prevent excessive API calls while keeping weather fresh
let cachedData: {
  weather: WeatherData;
  sources: Array<{ title: string; url: string }>;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp < CACHE_TTL_MS)) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY not configured',
          weather: getFallbackWeather(),
          sources: [],
          cached: false,
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (CatiaCooking/1.0)',
        },
      },
    });

    const prompt = `What is the current live weather right now in Mindelo, São Vicente, Cape Verde?
Search Google for the latest weather conditions in Mindelo today.
Provide the response strictly in valid JSON format in English with these exact fields:
{
  "temperature": "26°C",
  "condition": "Sunny with ocean breeze",
  "conditionEnglish": "Sunny with ocean breeze",
  "wind": "22 km/h NE",
  "humidity": "65%",
  "iconType": "sunny", // one of: "sunny", "cloudy", "partly-cloudy", "rainy", "windy"
  "studentTip": "Wonderful weather in Mindelo for visiting the Municipal Market and selecting fresh fish with Cátia!",
  "comfortLevel": "Pleasant and breezy with classic trade winds over the Bay of Mindelo"
}
Only output the JSON object without any backticks, markdown, or extra prose.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    
    // Extract search grounding sources if present
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; url: string }> = [];
    
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || 'Google Search',
          url: chunk.web.uri,
        });
      }
    }

    let parsedWeather = null;
    try {
      // Clean potential markdown formatting
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedWeather = JSON.parse(cleaned);
    } catch {
      // Try regex matching JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedWeather = JSON.parse(jsonMatch[0]);
        } catch {
          parsedWeather = null;
        }
      }
    }

    if (!parsedWeather || !parsedWeather.temperature) {
      parsedWeather = getFallbackWeather();
    }

    const result = {
      weather: parsedWeather,
      sources: sources.slice(0, 3), // top 3 search sources
      timestamp: now,
    };

    cachedData = result;

    return NextResponse.json({
      ...result,
      cached: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error fetching weather';
    return NextResponse.json({
      weather: getFallbackWeather(),
      sources: [],
      error: message,
      cached: false,
    });
  }
}

function getFallbackWeather() {
  return {
    temperature: '26°C',
    condition: 'Sunny with ocean breeze',
    conditionEnglish: 'Sunny with ocean breeze',
    wind: '22 km/h NE',
    humidity: '68%',
    iconType: 'partly-cloudy',
    studentTip: 'Pleasant weather in Mindelo for cooking! Bring comfortable clothes and enjoy the fresh ocean breeze.',
    comfortLevel: 'Warm and comfortable, ideal for walking to the market and cooking together.',
  };
}
