import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { Button, Encouragement } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'

type Phase = 'inhale1' | 'inhale2' | 'exhale'

interface PhysiologicalSighProps {
  onComplete: () => void
  onCancel: () => void
  cycles?: number
}

const phaseConfig = {
  inhale1: { duration: 2, instruction: 'Deep breath in...', scale: 1.2 },
  inhale2: { duration: 1, instruction: 'Quick sip of air...', scale: 1.35 },
  exhale: { duration: 6, instruction: 'Long slow exhale...', scale: 1 }
}

export function PhysiologicalSigh({ onComplete, onCancel, cycles = 3 }: PhysiologicalSighProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale1')
  const [timeLeft, setTimeLeft] = useState(phaseConfig.inhale1.duration)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const getNextPhase = useCallback((current: Phase): { phase: Phase; isNewCycle: boolean } => {
    switch (current) {
      case 'inhale1': return { phase: 'inhale2', isNewCycle: false }
      case 'inhale2': return { phase: 'exhale', isNewCycle: false }
      case 'exhale': return { phase: 'inhale1', isNewCycle: true }
    }
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
              addToolUsed('Physiological sigh')
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
          return phaseConfig[nextPhase].duration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, currentCycle, cycles, isRunning, getNextPhase, onComplete, addToolUsed, haptic])

  const handleRestart = () => {
    setPhase('inhale1')
    setTimeLeft(phaseConfig.inhale1.duration)
    setCurrentCycle(1)
    setIsRunning(true)
  }

  const handleStart = () => {
    setHasStarted(true)
    setIsRunning(true)
  }

  const currentConfig = phaseConfig[phase]

  // Start screen
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-warm-50 flex flex-col items-center justify-center px-6 z-40">
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 rounded-full bg-warm-100 text-warm-900/60 hover:text-warm-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Lung visualization preview */}
          <div className="relative w-48 h-56 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              className="w-36 h-44 rounded-[40%] bg-gradient-to-b from-warm-400/40 via-warm-500/40 to-warm-600/40"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <h2 className="text-2xl font-semibold text-warm-900 mb-3">Physiological Sigh</h2>
          <p className="text-warm-900/60 max-w-xs mx-auto mb-2">
            The fastest way to calm down. Two inhales, then a long exhale.
          </p>
          <p className="text-warm-900/40 text-sm mb-8">
            {cycles} cycles • ~9s each
          </p>

          <button
            onClick={handleStart}
            className="px-12 py-4 rounded-full btn-panic text-xl font-semibold"
          >
            Start
          </button>
        </motion.div>
      </div>
    )
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
          Sigh {currentCycle} of {cycles}
        </span>
        <button
          onClick={handleRestart}
          className="p-2 rounded-full bg-warm-100 text-warm-900/60 hover:text-warm-900 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Description */}
      <div className="absolute top-20 text-center px-6">
        <p className="text-warm-900/60 text-sm max-w-xs mx-auto">
          The physiological sigh is the fastest way to calm down.
          Two inhales through the nose, then a long exhale through the mouth.
        </p>
      </div>

      {/* Breathing visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Lung-like visualization */}
        <motion.div
          className="w-48 h-56 rounded-[40%] bg-gradient-to-b from-warm-400/40 via-warm-500/40 to-warm-600/40"
          animate={{
            scale: currentConfig.scale,
            borderRadius: phase === 'inhale2' ? '45%' : '40%'
          }}
          transition={{
            duration: currentConfig.duration,
            ease: phase === 'inhale2' ? 'easeOut' : 'easeInOut'
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
              className="text-xl font-medium text-warm-900 mb-2 text-center px-4"
            >
              {currentConfig.instruction}
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
        <div className={`px-3 py-1 rounded-full text-sm ${phase === 'inhale1' ? 'bg-warm-500 text-white' : 'bg-warm-200 text-warm-900/60'}`}>
          In
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${phase === 'inhale2' ? 'bg-warm-500 text-white' : 'bg-warm-200 text-warm-900/60'}`}>
          +Sip
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${phase === 'exhale' ? 'bg-warm-500 text-white' : 'bg-warm-200 text-warm-900/60'}`}>
          Out
        </div>
      </div>

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
