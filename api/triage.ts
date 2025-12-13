import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.3,
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
    const { intensity, symptoms, triggers, userMessage } = req.body

    const prompt = `You are a mental health triage assistant. Based on the following information, assess the anxiety severity and recommend an intervention.

User state:
- Anxiety intensity: ${intensity}/10
- Physical symptoms: ${symptoms?.length > 0 ? symptoms.join(', ') : 'None reported'}
- Triggers: ${triggers?.length > 0 ? triggers.join(', ') : 'None identified'}
${userMessage ? `- User message: "${userMessage}"` : ''}

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "severity": "mild" | "moderate" | "severe",
  "suggestedFlow": "breathing" | "grounding" | "stabilize" | "reframe" | "check_in",
  "reasoning": "Brief explanation (1 sentence)"
}

Guidelines:
- mild (1-3): Manageable anxiety, suggest check_in or breathing
- moderate (4-6): Notable distress, suggest breathing or grounding
- severe (7-10): High distress, suggest stabilize (breathing + grounding combined)
- If symptoms include "Racing heart" or "Tight chest", lean toward grounding
- If symptoms include "Racing thoughts", lean toward breathing
- Never diagnose, only assess current state`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return res.status(200).json({
        severity: parsed.severity,
        suggestedFlow: parsed.suggestedFlow,
        isCrisis: false,
        isMedicalConcern: false,
        reasoning: parsed.reasoning
      })
    }

    // Fallback
    return res.status(200).json({
      severity: intensity >= 7 ? 'severe' : intensity >= 4 ? 'moderate' : 'mild',
      suggestedFlow: intensity >= 7 ? 'stabilize' : 'breathing',
      isCrisis: false,
      isMedicalConcern: false,
      reasoning: 'Fallback assessment based on intensity'
    })

  } catch (error) {
    console.error('Triage error:', error)
    return res.status(500).json({ error: 'Failed to process triage' })
  }
}
