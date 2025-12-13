import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500
  }
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { situation, automaticThought, emotion } = req.body

    const prompt = `You are a gentle CBT coach helping someone reframe an anxious thought.

Situation: ${situation}
Automatic thought: "${automaticThought}"
Emotion felt: ${emotion}

Respond with ONLY a JSON object:
{
  "validation": "Brief validation of their feeling (1 sentence, warm)",
  "balancedThought": "A more balanced alternative thought (1-2 sentences)"
}

Guidelines:
- First validate their emotion - it's real and makes sense
- Don't dismiss or minimize their concern
- Offer a gentler, more balanced perspective
- Use "What if..." or "It's also possible that..." framing
- Keep it short and conversational
- Never say their thought is "wrong" or "irrational"`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return res.status(200).json({
        validation: parsed.validation,
        balancedThought: parsed.balancedThought
      })
    }

    // Fallback
    return res.status(200).json({
      validation: `It makes sense that you'd feel ${emotion?.toLowerCase()} in that situation.`,
      balancedThought: 'What would you tell a friend who had this same thought? Often we\'re kinder to others than to ourselves.'
    })

  } catch (error) {
    console.error('Reframe error:', error)
    return res.status(500).json({ error: 'Failed to generate reframe' })
  }
}
