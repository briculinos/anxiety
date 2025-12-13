import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { Button } from '../common'
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
  const [phase, setPhase] = useState<Phase>('inhale1')
  const [timeLeft, setTimeLeft] = useState(phaseConfig.inhale1.duration)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [isRunning, setIsRunning] = useState(true)
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

  const currentConfig = phaseConfig[phase]

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center px-6 z-40">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-slate-400 text-sm">
          Sigh {currentCycle} of {cycles}
        </span>
        <button
          onClick={handleRestart}
          className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Description */}
      <div className="absolute top-20 text-center px-6">
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          The physiological sigh is the fastest way to calm down.
          Two inhales through the nose, then a long exhale through the mouth.
        </p>
      </div>

      {/* Breathing visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Lung-like visualization */}
        <motion.div
          className="w-48 h-56 rounded-[40%] bg-gradient-to-b from-cyan-400/40 via-blue-400/40 to-indigo-400/40"
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
              className="text-xl font-medium text-white mb-2 text-center px-4"
            >
              {currentConfig.instruction}
            </motion.span>
          </AnimatePresence>
          <span className="text-5xl font-bold text-white">{timeLeft}</span>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="mt-12 flex gap-3">
        <div className={`px-3 py-1 rounded-full text-sm ${phase === 'inhale1' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
          In
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${phase === 'inhale2' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
          +Sip
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${phase === 'exhale' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
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
