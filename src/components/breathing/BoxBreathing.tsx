import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { Button, Encouragement } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2'

interface BoxBreathingProps {
  onComplete: () => void
  onCancel: () => void
  pace?: 'slow' | 'medium' | 'fast'
  cycles?: number
}

const paceSettings = {
  slow: { inhale: 5, hold: 5, exhale: 5 },
  medium: { inhale: 4, hold: 4, exhale: 4 },
  fast: { inhale: 3, hold: 3, exhale: 3 }
}

const phaseInstructions: Record<Phase, string> = {
  inhale: 'Breathe in...',
  hold1: 'Hold...',
  exhale: 'Breathe out...',
  hold2: 'Hold...'
}

export function BoxBreathing({ onComplete, onCancel, pace = 'medium', cycles = 4 }: BoxBreathingProps) {
  const [phase, setPhase] = useState<Phase>('inhale')
  const [timeLeft, setTimeLeft] = useState(paceSettings[pace].inhale)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [isRunning, setIsRunning] = useState(true)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const settings = paceSettings[pace]
  const totalPhases = 4
  const phaseOrder: Phase[] = ['inhale', 'hold1', 'exhale', 'hold2']

  const getDuration = (p: Phase) => {
    switch (p) {
      case 'inhale': return settings.inhale
      case 'hold1':
      case 'hold2': return settings.hold
      case 'exhale': return settings.exhale
    }
  }

  const getNextPhase = useCallback((currentPhase: Phase): { phase: Phase; isNewCycle: boolean } => {
    const currentIndex = phaseOrder.indexOf(currentPhase)
    const nextIndex = (currentIndex + 1) % totalPhases
    const isNewCycle = nextIndex === 0
    return { phase: phaseOrder[nextIndex], isNewCycle }
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const { phase: nextPhase, isNewCycle } = getNextPhase(phase)

          if (isNewCycle) {
            if (currentCycle >= cycles) {
              setIsRunning(false)
              addToolUsed('Box breathing')
              haptic.medium()
              setTimeout(onComplete, 500)
              return 0
            }
            setCurrentCycle(c => c + 1)
            // Show encouragement on cycle complete
            setShowEncouragement(true)
            setTimeout(() => setShowEncouragement(false), 1500)
          }

          haptic.light()
          setPhase(nextPhase)
          return getDuration(nextPhase)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, currentCycle, cycles, isRunning, getNextPhase, onComplete, addToolUsed, haptic])

  const getScale = () => {
    switch (phase) {
      case 'inhale': return 1.3
      case 'hold1': return 1.3
      case 'exhale': return 1
      case 'hold2': return 1
    }
  }

  const handleRestart = () => {
    setPhase('inhale')
    setTimeLeft(settings.inhale)
    setCurrentCycle(1)
    setIsRunning(true)
  }

  return (
    <div className="fixed inset-0 bg-warm-50 flex flex-col items-center justify-center px-6 z-40">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-warm-100 text-warm-900/60 hover:text-warm-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-warm-900/60 text-sm">
          Cycle {currentCycle} of {cycles}
        </span>
        <button
          onClick={handleRestart}
          className="p-2 rounded-full bg-warm-100 text-warm-900/60 hover:text-warm-900 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Breathing visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-warm-200" />

        {/* Animated circle */}
        <motion.div
          className="w-48 h-48 rounded-full bg-gradient-to-br from-warm-500 via-warm-400 to-warm-300 opacity-60"
          animate={{
            scale: getScale(),
            opacity: phase === 'hold1' || phase === 'hold2' ? 0.8 : 0.6
          }}
          transition={{
            duration: getDuration(phase),
            ease: 'easeInOut'
          }}
        />

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-medium text-warm-900 mb-2"
            >
              {phaseInstructions[phase]}
            </motion.span>
          </AnimatePresence>
          <span className="text-5xl font-bold text-warm-900">{timeLeft}</span>
        </div>
      </div>

      {/* Encouragement */}
      <div className="mt-8 h-10">
        <Encouragement
          show={showEncouragement}
          type={currentCycle >= cycles - 1 ? 'almostDone' : 'cycleComplete'}
        />
      </div>

      {/* Phase indicators */}
      <div className="mt-4 flex gap-3">
        {phaseOrder.map((p, i) => (
          <div
            key={p}
            className={`w-3 h-3 rounded-full transition-colors ${
              phaseOrder.indexOf(phase) >= i ? 'bg-warm-500' : 'bg-warm-200'
            }`}
          />
        ))}
      </div>

      {/* Instructions */}
      <p className="mt-6 text-warm-900/60 text-center max-w-xs">
        Box breathing helps activate your body's relaxation response
      </p>

      {/* Complete button (appears when done) */}
      {!isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Button variant="primary" onClick={onComplete}>
            Continue
          </Button>
        </motion.div>
      )}
    </div>
  )
}
