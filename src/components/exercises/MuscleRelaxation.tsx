import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Check } from 'lucide-react'
import { Button } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'

interface MuscleGroup {
  name: string
  instruction: string
  location: string
}

const muscleGroups: MuscleGroup[] = [
  { name: 'Hands', instruction: 'Make tight fists with both hands', location: 'hands and forearms' },
  { name: 'Arms', instruction: 'Bend your elbows and tense your biceps', location: 'upper arms' },
  { name: 'Shoulders', instruction: 'Raise your shoulders up toward your ears', location: 'shoulders and neck' },
  { name: 'Face', instruction: 'Scrunch your face tightly', location: 'forehead, eyes, and jaw' },
  { name: 'Chest', instruction: 'Take a deep breath and hold it', location: 'chest' },
  { name: 'Stomach', instruction: 'Tighten your stomach muscles', location: 'abdomen' },
  { name: 'Legs', instruction: 'Straighten your legs and point your toes', location: 'thighs and calves' }
]

type Phase = 'tense' | 'release' | 'rest'

interface MuscleRelaxationProps {
  onComplete: () => void
  onCancel: () => void
  shortened?: boolean // Use fewer muscle groups
}

export function MuscleRelaxation({ onComplete, onCancel, shortened = true }: MuscleRelaxationProps) {
  const groups = shortened ? muscleGroups.slice(0, 4) : muscleGroups
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('tense')
  const [timeLeft, setTimeLeft] = useState(5)
  const [isComplete, setIsComplete] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const currentGroup = groups[currentGroupIndex]

  const phaseDurations = {
    tense: 5,
    release: 3,
    rest: 5
  }

  useEffect(() => {
    if (isComplete) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'tense') {
            haptic.light()
            setPhase('release')
            return phaseDurations.release
          } else if (phase === 'release') {
            setPhase('rest')
            return phaseDurations.rest
          } else {
            // Move to next muscle group
            if (currentGroupIndex < groups.length - 1) {
              setCurrentGroupIndex(prev => prev + 1)
              setPhase('tense')
              return phaseDurations.tense
            } else {
              setIsComplete(true)
              addToolUsed('Muscle relaxation')
              haptic.medium()
              return 0
            }
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, currentGroupIndex, groups.length, isComplete, haptic, addToolUsed])

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'tense': return currentGroup.instruction
      case 'release': return 'Let go completely...'
      case 'rest': return `Notice how your ${currentGroup.location} feel now`
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'tense': return 'from-orange-400 to-red-400'
      case 'release': return 'from-green-400 to-emerald-400'
      case 'rest': return 'from-blue-400 to-indigo-400'
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
          Progressive Muscle Relaxation
        </span>
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="px-4">
        <div className="flex justify-between text-xs text-warm-900/60 mb-2">
          <span>{currentGroup.name}</span>
          <span>{currentGroupIndex + 1} of {groups.length}</span>
        </div>
        <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-warm-500 to-warm-400"
            animate={{ width: `${((currentGroupIndex + 1) / groups.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={`${currentGroupIndex}-${phase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              {/* Phase indicator */}
              <motion.div
                className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center`}
                animate={{
                  scale: phase === 'tense' ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 1,
                  repeat: phase === 'tense' ? Infinity : 0
                }}
              >
                <span className="text-4xl font-bold text-white">{timeLeft}</span>
              </motion.div>

              {/* Phase label */}
              <div className={`text-2xl font-bold bg-gradient-to-r ${getPhaseColor()} bg-clip-text text-transparent`}>
                {phase === 'tense' ? 'TENSE' : phase === 'release' ? 'RELEASE' : 'REST'}
              </div>

              {/* Instruction */}
              <p className="text-xl text-warm-900 max-w-xs">
                {getPhaseInstruction()}
              </p>

              {/* Muscle group indicator */}
              <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {groups.map((group, i) => (
                  <div
                    key={group.name}
                    className={`px-3 py-1 rounded-full text-sm ${
                      i < currentGroupIndex
                        ? 'bg-warm-700/20 text-warm-700'
                        : i === currentGroupIndex
                        ? 'bg-warm-500/20 text-warm-500'
                        : 'bg-warm-200 text-warm-900/50'
                    }`}
                  >
                    {i < currentGroupIndex && <Check className="w-3 h-3 inline mr-1" />}
                    {group.name}
                  </div>
                ))}
              </div>
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
              <h2 className="text-2xl font-bold text-warm-900">Complete</h2>
              <p className="text-warm-900/70 max-w-xs">
                Notice the difference between tension and relaxation in your body.
              </p>
              <Button variant="primary" onClick={onComplete}>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tip */}
      {!isComplete && (
        <div className="p-6 safe-bottom">
          <p className="text-sm text-warm-900/50 text-center">
            {phase === 'tense'
              ? 'Hold the tension firmly but don\'t strain'
              : phase === 'release'
              ? 'Let the tension melt away suddenly'
              : 'Feel the relaxation spreading through your muscles'}
          </p>
        </div>
      )}
    </div>
  )
}
