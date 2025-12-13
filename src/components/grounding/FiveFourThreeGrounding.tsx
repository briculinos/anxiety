import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, Hand, Ear, Wind, Coffee, ChevronRight, Check } from 'lucide-react'
import { Button } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'

interface GroundingStep {
  sense: string
  icon: React.ElementType
  count: number
  prompt: string
  color: string
}

const steps: GroundingStep[] = [
  { sense: 'See', icon: Eye, count: 5, prompt: 'Name 5 things you can see right now', color: 'from-blue-400 to-cyan-400' },
  { sense: 'Touch', icon: Hand, count: 4, prompt: 'Name 4 things you can physically feel', color: 'from-green-400 to-emerald-400' },
  { sense: 'Hear', icon: Ear, count: 3, prompt: 'Name 3 things you can hear', color: 'from-yellow-400 to-orange-400' },
  { sense: 'Smell', icon: Wind, count: 2, prompt: 'Name 2 things you can smell', color: 'from-pink-400 to-rose-400' },
  { sense: 'Taste', icon: Coffee, count: 1, prompt: 'Name 1 thing you can taste', color: 'from-purple-400 to-violet-400' }
]

interface FiveFourThreeGroundingProps {
  onComplete: () => void
  onCancel: () => void
}

export function FiveFourThreeGrounding({ onComplete, onCancel }: FiveFourThreeGroundingProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [itemsNamed, setItemsNamed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const currentStep = steps[currentStepIndex]
  const Icon = currentStep.icon

  const handleItemNamed = () => {
    haptic.light()
    const newCount = itemsNamed + 1

    if (newCount >= currentStep.count) {
      // Move to next step
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1)
        setItemsNamed(0)
      } else {
        // All done
        setIsComplete(true)
        addToolUsed('5-4-3-2-1 grounding')
        haptic.medium()
      }
    } else {
      setItemsNamed(newCount)
    }
  }

  return (
    <div className="fixed inset-0 bg-warm-50 flex flex-col z-40">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-warm-100 text-warm-900/60 hover:text-warm-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-warm-900/60 text-sm">
          5-4-3-2-1 Grounding
        </span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-warm-500 to-warm-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + (itemsNamed / currentStep.count)) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center space-y-8"
            >
              {/* Icon */}
              <motion.div
                className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>

              {/* Count */}
              <div className="text-6xl font-bold text-warm-900">
                {currentStep.count - itemsNamed}
              </div>

              {/* Prompt */}
              <p className="text-xl text-warm-900 max-w-xs">
                {currentStep.prompt}
              </p>

              {/* Item indicators */}
              <div className="flex justify-center gap-3">
                {Array.from({ length: currentStep.count }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-4 h-4 rounded-full ${
                      i < itemsNamed ? 'bg-warm-700' : 'bg-warm-200'
                    }`}
                  />
                ))}
              </div>

              {/* Named button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleItemNamed}
                className="w-full max-w-xs"
              >
                I named one
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Hint */}
              <p className="text-sm text-warm-900/40">
                Take your time. Look around you.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-warm-700/20 flex items-center justify-center">
                <Check className="w-12 h-12 text-warm-700" />
              </div>
              <h2 className="text-2xl font-bold text-warm-900">Well done</h2>
              <p className="text-warm-900/60 max-w-xs">
                You've reconnected with the present moment.
                How are you feeling now?
              </p>
              <Button variant="primary" onClick={onComplete}>
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step indicators */}
      <div className="p-6 safe-bottom">
        <div className="flex justify-center gap-2">
          {steps.map((step, i) => (
            <div
              key={step.sense}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                i < currentStepIndex
                  ? 'bg-warm-700/20 text-warm-700'
                  : i === currentStepIndex
                  ? 'bg-warm-500/20 text-warm-500'
                  : 'bg-warm-200 text-warm-900/40'
              }`}
            >
              {i < currentStepIndex && <Check className="w-3 h-3" />}
              {step.count}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
