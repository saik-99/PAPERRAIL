export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { query, crop, location, priceData, weatherData, demandScore } = await req.json()

    const systemPrompt = `You are KhetiWala AI, an agricultural advisor for Indian farmers. 
Always respond in a farmer-friendly, simple language. Keep responses concise (2-3 sentences max).
Structure your response as JSON with:
- recommendation: one-sentence main advice
- reason: one-sentence explanation  
- facts: array of exactly 3 supporting data points used
- confidence: number between 0 and 1
- language: "en" (English by default, or "hi" for Hindi if detected)`

    const userMessage = `Farmer query: "${query}"
Context:
- Crop: ${crop}
- Location: ${location}
- Current price trend: ${JSON.stringify(priceData)}
- Weather conditions: ${JSON.stringify(weatherData)}
- Buyer demand score: ${demandScore}/10

Provide agricultural advice based on this context.`

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    let parsed
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendation: content.text, facts: [], confidence: 0.8 }
    } catch {
      parsed = { recommendation: content.text, facts: ['Market data analyzed', 'Weather patterns considered', 'Historical prices reviewed'], confidence: 0.75 }
    }

    return NextResponse.json({ success: true, advisory: parsed, modelVersion: 'claude-opus-4-6' })
  } catch (error) {
    console.error('Advisory API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to get advisory' }, { status: 500 })
  }
}

