import { logSafetyEvent } from '../db'

// Crisis-related keywords - trigger immediate crisis screen
const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'end my life',
  'end it all',
  'want to die',
  'better off dead',
  'self-harm',
  'self harm',
  'hurt myself',
  'cutting',
  'can\'t go on',
  'cannot go on',
  'no reason to live',
  'give up',
  'hopeless'
]

// Medical concern keywords - suggest seeking medical help
const MEDICAL_KEYWORDS = [
  'chest pain',
  'heart attack',
  'can\'t breathe',
  'cannot breathe',
  'passing out',
  'fainting',
  'fainted',
  'blacking out',
  'numbness',
  'severe pain',
  'emergency'
]

export interface SafetyCheck {
  isCrisis: boolean
  isMedicalConcern: boolean
  matchedKeywords: string[]
}

export function checkForCrisis(text: string): SafetyCheck {
  const lowerText = text.toLowerCase()
  const matchedCrisis: string[] = []
  const matchedMedical: string[] = []

  // Check crisis keywords
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      matchedCrisis.push(keyword)
    }
  }

  // Check medical keywords
  for (const keyword of MEDICAL_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      matchedMedical.push(keyword)
    }
  }

  return {
    isCrisis: matchedCrisis.length > 0,
    isMedicalConcern: matchedMedical.length > 0,
    matchedKeywords: [...matchedCrisis, ...matchedMedical]
  }
}

export async function handleCrisisDetected(actionTaken: string) {
  await logSafetyEvent({
    timestamp: new Date(),
    type: 'crisis_detected',
    actionTaken
  })
}

export async function handleMedicalConcern(actionTaken: string) {
  await logSafetyEvent({
    timestamp: new Date(),
    type: 'medical_warning',
    actionTaken
  })
}

export async function handleCrisisScreenShown() {
  await logSafetyEvent({
    timestamp: new Date(),
    type: 'crisis_screen_shown',
    actionTaken: 'Crisis screen displayed to user'
  })
}

// Determine severity based on intensity and symptoms
export function assessSeverity(
  intensity: number,
  symptoms: string[],
  textInput?: string
): 'mild' | 'moderate' | 'severe' | 'crisis' {
  // Check for crisis keywords first
  if (textInput) {
    const safetyCheck = checkForCrisis(textInput)
    if (safetyCheck.isCrisis) {
      return 'crisis'
    }
  }

  // Physical symptoms that indicate higher severity
  const severeSymptoms = [
    'Racing heart',
    'Tight chest',
    'Dizziness',
    'Feeling detached'
  ]

  const severeSymptomCount = symptoms.filter(s => severeSymptoms.includes(s)).length

  // Determine severity based on intensity and symptoms
  if (intensity >= 9 || (intensity >= 7 && severeSymptomCount >= 2)) {
    return 'severe'
  }

  if (intensity >= 6 || (intensity >= 4 && severeSymptomCount >= 1)) {
    return 'moderate'
  }

  return 'mild'
}

// Get recommended flow based on severity
export function getRecommendedFlow(severity: 'mild' | 'moderate' | 'severe' | 'crisis'): string {
  switch (severity) {
    case 'crisis':
      return 'crisis_support'
    case 'severe':
      return 'stabilize' // Breathing + grounding
    case 'moderate':
      return 'breathing' // Just breathing exercise
    case 'mild':
      return 'check_in' // Quick check-in, maybe just tracking
    default:
      return 'breathing'
  }
}

// Default emergency resources (can be customized by user)
export const DEFAULT_EMERGENCY_RESOURCES = {
  US: {
    crisis: '988', // Suicide & Crisis Lifeline
    text: 'Text HOME to 741741',
    emergency: '911'
  },
  UK: {
    crisis: '116 123', // Samaritans
    text: 'Text SHOUT to 85258',
    emergency: '999'
  },
  International: {
    website: 'https://findahelpline.com',
    emergency: 'Local emergency number'
  }
}
