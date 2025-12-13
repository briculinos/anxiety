// Episode tracking
export interface Episode {
  id: string
  timestamp: Date
  intensity: number // 0-10
  durationMinutes?: number
  triggers: string[]
  symptoms: string[]
  toolsUsed: string[]
  helpfulRating?: number // 1-5
  notes?: string
  completedFlow?: string
}

// User preferences
export interface UserProfile {
  id: string
  name?: string
  preferredBreathingPace: 'slow' | 'medium' | 'fast'
  favoriteTools: string[]
  customMantras: string[]
  safeMemories: SafeMemory[]
  triggerCategories: string[]
  emergencyContacts: EmergencyContact[]
  createdAt: Date
  updatedAt: Date
}

export interface SafeMemory {
  id: string
  title: string
  description: string
  createdAt: Date
}

export interface EmergencyContact {
  id: string
  name: string
  phone?: string
  relationship: string
}

// Safety tracking (minimal data)
export interface SafetyEvent {
  id: string
  timestamp: Date
  type: 'crisis_detected' | 'medical_warning' | 'crisis_screen_shown'
  actionTaken: string
}

// Worry postponement
export interface PostponedWorry {
  id: string
  worry: string
  createdAt: Date
  scheduledFor: Date
  addressed: boolean
}

// Toolbox items
export interface ToolboxItem {
  id: string
  type: 'mantra' | 'memory' | 'playlist' | 'technique' | 'custom'
  title: string
  content: string
  url?: string
  isFavorite: boolean
  usageCount: number
  lastUsed?: Date
}

// Flow states
export type FlowState =
  | 'idle'
  | 'assessing'
  | 'breathing'
  | 'grounding'
  | 'reframing'
  | 'muscle_relaxation'
  | 'worry_postpone'
  | 'next_step'
  | 'complete'

// Severity levels
export type Severity = 'mild' | 'moderate' | 'severe' | 'crisis'

// Triage result
export interface TriageResult {
  severity: Severity
  suggestedFlow: string
  isCrisis: boolean
  isMedicalConcern: boolean
  reasoning?: string
}

// Breathing exercise types
export type BreathingType = 'box' | 'paced' | 'physiological_sigh' | '478'

export interface BreathingConfig {
  type: BreathingType
  name: string
  description: string
  inhale: number // seconds
  holdAfterInhale: number
  exhale: number
  holdAfterExhale: number
  cycles: number
}

// Grounding exercise
export interface GroundingStep {
  sense: 'see' | 'touch' | 'hear' | 'smell' | 'taste'
  count: number
  prompt: string
  examples: string[]
}

// Thought helper (CBT)
export interface ThoughtRecord {
  id: string
  timestamp: Date
  situation: string
  automaticThought: string
  emotion: string
  emotionIntensity: number // 0-10
  cognitiveDistortion?: string
  balancedThought?: string
  newEmotionIntensity?: number // 0-10
}

// Weekly insight
export interface WeeklyInsight {
  id: string
  weekStart: Date
  weekEnd: Date
  totalEpisodes: number
  averageIntensity: number
  topTriggers: { trigger: string; count: number }[]
  topTools: { tool: string; count: number; avgHelpfulness: number }[]
  timePatterns: { hour: number; count: number }[]
  generatedInsight?: string
  suggestedExperiment?: string
}

// App settings
export interface AppSettings {
  hapticFeedback: boolean
  soundEnabled: boolean
  darkMode: boolean // always dark for MVP
  language: string
  crisisHotline: string
}

// Default trigger categories
export const DEFAULT_TRIGGERS = [
  'Work',
  'Social',
  'Health',
  'Family',
  'Money',
  'Future',
  'Past',
  'Uncertainty',
  'Conflict',
  'Performance',
  'Other'
] as const

// Default symptoms
export const DEFAULT_SYMPTOMS = [
  'Racing heart',
  'Tight chest',
  'Shallow breathing',
  'Sweating',
  'Trembling',
  'Nausea',
  'Dizziness',
  'Racing thoughts',
  'Feeling detached',
  'Restlessness'
] as const

// Default tools
export const DEFAULT_TOOLS = [
  'Box breathing',
  'Paced breathing',
  'Physiological sigh',
  '5-4-3-2-1 grounding',
  'Muscle relaxation',
  'Thought reframe',
  'Worry postponement',
  'Safe memory',
  'Mantra',
  'Walk',
  'Water',
  'Talk to someone'
] as const
