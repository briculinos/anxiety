import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { Button, Encouragement } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'

type Phase = 'inhale' | 'exhale'

interface PacedBreathingProps {
  onComplete: () => void
  onCancel: () => void
  inhaleTime?: number
  exhaleTime?: number
  cycles?: number
}

export function PacedBreathing({
  onComplete,
  onCancel,
  inhaleTime = 4,
  exhaleTime = 6,
  cycles = 6
}: PacedBreathingProps) {
  const [phase, setPhase] = useState<Phase>('inhale')
  const [timeLeft, setTimeLeft] = useState(inhaleTime)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [isRunning, setIsRunning] = useState(true)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const getDuration = useCallback((p: Phase) => {
    return p === 'inhale' ? inhaleTime : exhaleTime
  }, [inhaleTime, exhaleTime])

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const nextPhase = phase === 'inhale' ? 'exhale' : 'inhale'
          const isNewCycle = nextPhase === 'inhale'

          if (isNewCycle) {
            if (currentCycle >= cycles) {
              setIsRunning(false)
              addToolUsed('Paced breathing')
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
  }, [phase, currentCycle, cycles, isRunning, getDuration, onComplete, addToolUsed, haptic])

  const handleRestart = () => {
    setPhase('inhale')
    setTimeLeft(inhaleTime)
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
          Breath {currentCycle} of {cycles}
        </span>
        <button
          onClick={handleRestart}
          className="p-2 rounded-full bg-warm-100 text-warm-900/60 hover:text-warm-900 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Breathing visualization - wave style */}
      <div className="relative w-80 h-48 flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-warm-500/30 to-transparent"
          animate={{
            y: phase === 'inhale' ? '-50%' : '0%'
          }}
          transition={{
            duration: getDuration(phase),
            ease: 'easeInOut'
          }}
        />

        {/* Ripple effect */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              key={`${phase}-${currentCycle}`}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-32 h-32 rounded-full border-2 border-warm-400"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Center content */}
      <div className="mt-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-3xl font-medium text-warm-900">
              {phase === 'inhale' ? 'Breathe in...' : 'Breathe out...'}
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="block text-6xl font-bold text-warm-900 mt-4">{timeLeft}</span>
      </div>

      {/* Encouragement */}
      <div className="mt-6 h-10">
        <Encouragement
          show={showEncouragement}
          type={currentCycle >= cycles - 1 ? 'almostDone' : 'cycleComplete'}
        />
      </div>

      {/* Timing info */}
      <div className="mt-4 flex gap-8 text-warm-900/60 text-sm">
        <div className={phase === 'inhale' ? 'text-warm-500' : ''}>
          In: {inhaleTime}s
        </div>
        <div className={phase === 'exhale' ? 'text-warm-500' : ''}>
          Out: {exhaleTime}s
        </div>
      </div>

      {/* Instructions */}
      <p className="mt-8 text-warm-900/60 text-center max-w-xs">
        Longer exhales activate your parasympathetic nervous system, promoting calm
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
