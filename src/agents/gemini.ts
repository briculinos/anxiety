import type { TriageResult, Episode } from '../types'
import { checkForCrisis } from '../utils/safety'

// API base URL - uses relative path in production (same domain)
const API_BASE = import.meta.env.PROD ? '/api' : '/api'

// Triage agent - classifies user state and suggests appropriate intervention
export async function triageUser(
  intensity: number,
  symptoms: string[],
  triggers: string[],
  userMessage?: string
): Promise<TriageResult> {
  // First, check for crisis keywords locally (faster, more reliable)
  if (userMessage) {
    const safetyCheck = checkForCrisis(userMessage)
    if (safetyCheck.isCrisis) {
      return {
        severity: 'crisis',
        suggestedFlow: 'crisis_support',
        isCrisis: true,
        isMedicalConcern: false,
        reasoning: 'Crisis keywords detected'
      }
    }
    if (safetyCheck.isMedicalConcern) {
      return {
        severity: 'severe',
        suggestedFlow: 'medical_check',
        isCrisis: false,
        isMedicalConcern: true,
        reasoning: 'Medical concern keywords detected'
      }
    }
  }

  try {
    const response = await fetch(`${API_BASE}/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intensity, symptoms, triggers, userMessage })
    })

    if (!response.ok) throw new Error('API error')

    return await response.json()
  } catch (error) {
    console.error('Triage error:', error)
    // Fallback to rule-based assessment
    return {
      severity: intensity >= 7 ? 'severe' : intensity >= 4 ? 'moderate' : 'mild',
      suggestedFlow: intensity >= 7 ? 'stabilize' : 'breathing',
      isCrisis: false,
      isMedicalConcern: false,
      reasoning: 'Fallback assessment based on intensity'
    }
  }
}

// Generate personalized insights from episode history
export async function generateWeeklyInsight(
  episodes: Episode[],
  topTriggers: { trigger: string; count: number }[],
  topTools: { tool: string; count: number; avgHelpfulness: number }[]
): Promise<{ insight: string; experiment: string }> {
  if (episodes.length === 0) {
    return {
      insight: 'No episodes recorded this week. That\'s great progress!',
      experiment: 'Try noting moments when you felt calm and what contributed to that feeling.'
    }
  }

  const avgIntensity = episodes.reduce((sum, ep) => sum + ep.intensity, 0) / episodes.length

  try {
    const response = await fetch(`${API_BASE}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeCount: episodes.length,
        avgIntensity: avgIntensity.toFixed(1),
        topTriggers,
        topTools
      })
    })

    if (!response.ok) throw new Error('API error')

    return await response.json()
  } catch (error) {
    console.error('Insight generation error:', error)
    // Fallback
    return {
      insight: `You logged ${episodes.length} episode${episodes.length === 1 ? '' : 's'} this week with an average intensity of ${avgIntensity.toFixed(1)}. You're building awareness of your patterns.`,
      experiment: topTools.length > 0
        ? `Keep using ${topTools[0].tool} - it seems to be helping you.`
        : 'Try the box breathing exercise next time you feel anxious.'
    }
  }
}

// Generate a personalized reframe suggestion for a thought
export async function generateReframe(
  situation: string,
  automaticThought: string,
  emotion: string
): Promise<{ balancedThought: string; validation: string }> {
  try {
    const response = await fetch(`${API_BASE}/reframe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situation, automaticThought, emotion })
    })

    if (!response.ok) throw new Error('API error')

    return await response.json()
  } catch (error) {
    console.error('Reframe generation error:', error)
    // Fallback
    return {
      validation: `It makes sense that you'd feel ${emotion.toLowerCase()} in that situation.`,
      balancedThought: 'What would you tell a friend who had this same thought? Often we\'re kinder to others than to ourselves.'
    }
  }
}

// Suggest next steps based on current state (rule-based, no API needed)
export async function suggestNextStep(
  intensity: number,
  toolsUsed: string[],
  minutesSinceStart: number
): Promise<string[]> {
  const suggestions: string[] = []

  if (intensity > 5) {
    if (!toolsUsed.includes('Box breathing') && !toolsUsed.includes('Paced breathing')) {
      suggestions.push('Try a breathing exercise')
    }
    if (!toolsUsed.includes('5-4-3-2-1 grounding')) {
      suggestions.push('Try grounding (5-4-3-2-1)')
    }
  }

  if (intensity <= 5 || toolsUsed.length >= 2) {
    suggestions.push('Drink some water')
    suggestions.push('Take a short walk')
    suggestions.push('Message someone you trust')
  }

  if (minutesSinceStart > 10 && intensity > 3) {
    suggestions.push('It\'s okay to take a break')
  }

  if (suggestions.length < 3) {
    suggestions.push('Do a small, easy task')
    suggestions.push('Listen to calming music')
  }

  return suggestions.slice(0, 4)
}
