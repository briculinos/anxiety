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
    const { episodeCount, avgIntensity, topTriggers, topTools } = req.body

    if (episodeCount === 0) {
      return res.status(200).json({
        insight: 'No episodes recorded this week. That\'s great progress!',
        experiment: 'Try noting moments when you felt calm and what contributed to that feeling.'
      })
    }

    const prompt = `You are a supportive anxiety coach. Generate a brief weekly insight and one small experiment suggestion.

This week's data:
- Total episodes: ${episodeCount}
- Average intensity: ${avgIntensity}/10
- Top triggers: ${topTriggers?.map((t: {trigger: string, count: number}) => `${t.trigger} (${t.count}x)`).join(', ') || 'None identified'}
- Most helpful tools: ${topTools?.map((t: {tool: string, count: number, avgHelpfulness: number}) => `${t.tool} (used ${t.count}x, ${t.avgHelpfulness.toFixed(1)}/5 helpful)`).join(', ') || 'None recorded'}

Respond with ONLY a JSON object:
{
  "insight": "One encouraging observation about patterns (1-2 sentences, warm tone)",
  "experiment": "One tiny, specific experiment to try next week (1 sentence, actionable)"
}

Guidelines:
- Be warm and non-judgmental
- Focus on what's working, not what's wrong
- Make the experiment very small and doable
- Never diagnose or use clinical language
- If tools helped, celebrate that
- Examples of experiments: "Try box breathing before your first work meeting", "Notice if afternoon anxiety correlates with skipping lunch"`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return res.status(200).json({
        insight: parsed.insight,
        experiment: parsed.experiment
      })
    }

    // Fallback
    return res.status(200).json({
      insight: `You logged ${episodeCount} episode${episodeCount === 1 ? '' : 's'} this week with an average intensity of ${avgIntensity}. You're building awareness of your patterns.`,
      experiment: 'Try a new coping tool this week.'
    })

  } catch (error) {
    console.error('Insights error:', error)
    return res.status(500).json({ error: 'Failed to generate insights' })
  }
}
