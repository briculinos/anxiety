import { create } from 'zustand'
import type { FlowState, Severity, BreathingType } from '../types'

interface CurrentEpisode {
  startTime: Date
  intensity: number
  triggers: string[]
  symptoms: string[]
  toolsUsed: string[]
}

interface AppState {
  // Current flow state
  flowState: FlowState
  setFlowState: (state: FlowState) => void

  // Severity from triage
  currentSeverity: Severity | null
  setCurrentSeverity: (severity: Severity | null) => void

  // Current episode being tracked
  currentEpisode: CurrentEpisode | null
  startEpisode: (intensity: number) => void
  updateEpisode: (updates: Partial<CurrentEpisode>) => void
  addTrigger: (trigger: string) => void
  removeTrigger: (trigger: string) => void
  addSymptom: (symptom: string) => void
  removeSymptom: (symptom: string) => void
  addToolUsed: (tool: string) => void
  endEpisode: () => CurrentEpisode | null

  // Active exercise
  activeBreathing: BreathingType | null
  setActiveBreathing: (type: BreathingType | null) => void

  // Crisis mode
  showCrisisScreen: boolean
  setShowCrisisScreen: (show: boolean) => void

  // UI state
  activeTab: 'home' | 'toolbox' | 'reflect' | 'progress'
  setActiveTab: (tab: 'home' | 'toolbox' | 'reflect' | 'progress') => void

  // Settings
  hapticEnabled: boolean
  setHapticEnabled: (enabled: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  flowState: 'idle' as FlowState,
  currentSeverity: null,
  currentEpisode: null,
  activeBreathing: null,
  showCrisisScreen: false,
  activeTab: 'home' as const,
  hapticEnabled: true,
  soundEnabled: false
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setFlowState: (flowState) => set({ flowState }),

  setCurrentSeverity: (currentSeverity) => set({ currentSeverity }),

  startEpisode: (intensity) => set({
    currentEpisode: {
      startTime: new Date(),
      intensity,
      triggers: [],
      symptoms: [],
      toolsUsed: []
    },
    flowState: 'assessing'
  }),

  updateEpisode: (updates) => {
    const current = get().currentEpisode
    if (current) {
      set({ currentEpisode: { ...current, ...updates } })
    }
  },

  addTrigger: (trigger) => {
    const current = get().currentEpisode
    if (current && !current.triggers.includes(trigger)) {
      set({
        currentEpisode: {
          ...current,
          triggers: [...current.triggers, trigger]
        }
      })
    }
  },

  removeTrigger: (trigger) => {
    const current = get().currentEpisode
    if (current) {
      set({
        currentEpisode: {
          ...current,
          triggers: current.triggers.filter(t => t !== trigger)
        }
      })
    }
  },

  addSymptom: (symptom) => {
    const current = get().currentEpisode
    if (current && !current.symptoms.includes(symptom)) {
      set({
        currentEpisode: {
          ...current,
          symptoms: [...current.symptoms, symptom]
        }
      })
    }
  },

  removeSymptom: (symptom) => {
    const current = get().currentEpisode
    if (current) {
      set({
        currentEpisode: {
          ...current,
          symptoms: current.symptoms.filter(s => s !== symptom)
        }
      })
    }
  },

  addToolUsed: (tool) => {
    const current = get().currentEpisode
    if (current && !current.toolsUsed.includes(tool)) {
      set({
        currentEpisode: {
          ...current,
          toolsUsed: [...current.toolsUsed, tool]
        }
      })
    }
  },

  endEpisode: () => {
    const episode = get().currentEpisode
    set({
      currentEpisode: null,
      flowState: 'idle',
      currentSeverity: null,
      activeBreathing: null
    })
    return episode
  },

  setActiveBreathing: (activeBreathing) => set({ activeBreathing }),

  setShowCrisisScreen: (showCrisisScreen) => set({ showCrisisScreen }),

  setActiveTab: (activeTab) => set({ activeTab }),

  setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),

  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

  reset: () => set(initialState)
}))

// Helper hook for haptic feedback
export function useHaptic() {
  const hapticEnabled = useAppStore(state => state.hapticEnabled)

  return {
    light: () => {
      if (hapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    },
    medium: () => {
      if (hapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate(25)
      }
    },
    heavy: () => {
      if (hapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }
}
