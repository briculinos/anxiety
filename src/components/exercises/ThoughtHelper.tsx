import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Lightbulb, Check } from 'lucide-react'
import { Button, Card } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'
import { saveThoughtRecord } from '../../db'
import { generateReframe } from '../../agents/gemini'

type Step = 'situation' | 'thought' | 'emotion' | 'reframe' | 'complete'

interface ThoughtHelperProps {
  onComplete: () => void
  onCancel: () => void
}

const emotions = [
  'Anxious', 'Worried', 'Scared', 'Overwhelmed',
  'Frustrated', 'Sad', 'Angry', 'Hopeless',
  'Embarrassed', 'Guilty', 'Confused'
]

export function ThoughtHelper({ onComplete, onCancel }: ThoughtHelperProps) {
  const [step, setStep] = useState<Step>('situation')
  const [situation, setSituation] = useState('')
  const [thought, setThought] = useState('')
  const [emotion, setEmotion] = useState('')
  const [emotionIntensity, setEmotionIntensity] = useState(5)
  const [reframe, setReframe] = useState<{ validation: string; balanced: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const handleNext = async () => {
    haptic.light()

    if (step === 'situation' && situation.trim()) {
      setStep('thought')
    } else if (step === 'thought' && thought.trim()) {
      setStep('emotion')
    } else if (step === 'emotion' && emotion) {
      setIsLoading(true)
      try {
        const result = await generateReframe(situation, thought, emotion)
        setReframe({ validation: result.validation, balanced: result.balancedThought })
      } catch {
        setReframe({
          validation: `It's understandable to feel ${emotion.toLowerCase()} in this situation.`,
          balanced: 'What would you tell a friend who had this same thought?'
        })
      }
      setIsLoading(false)
      setStep('reframe')
    } else if (step === 'reframe') {
      // Save the thought record
      await saveThoughtRecord({
        timestamp: new Date(),
        situation,
        automaticThought: thought,
        emotion,
        emotionIntensity,
        balancedThought: reframe?.balanced
      })
      addToolUsed('Thought reframe')
      haptic.medium()
      setStep('complete')
    }
  }

  const handleBack = () => {
    haptic.light()
    if (step === 'thought') setStep('situation')
    else if (step === 'emotion') setStep('thought')
    else if (step === 'reframe') setStep('emotion')
  }

  const canProceed = () => {
    if (step === 'situation') return situation.trim().length > 0
    if (step === 'thought') return thought.trim().length > 0
    if (step === 'emotion') return emotion.length > 0
    return true
  }

  const renderStep = () => {
    switch (step) {
      case 'situation':
        return (
          <motion.div
            key="situation"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white">What's happening?</h2>
            <p className="text-slate-400 text-sm">
              Briefly describe the situation that's causing you anxiety.
            </p>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g., I have a presentation at work tomorrow..."
              className="w-full h-28 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </motion.div>
        )

      case 'thought':
        return (
          <motion.div
            key="thought"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white">What's the scary thought?</h2>
            <p className="text-slate-400 text-sm">
              What's your mind telling you might happen?
            </p>
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="e.g., I'll forget what to say and everyone will think I'm incompetent..."
              className="w-full h-28 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </motion.div>
        )

      case 'emotion':
        return (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white">How are you feeling?</h2>
            <p className="text-slate-400 text-sm">
              Pick the emotion that best describes how you feel.
            </p>
            <div className="flex flex-wrap gap-2">
              {emotions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    emotion === e
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {emotion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-4"
              >
                <label className="text-sm text-slate-300">
                  How intense is this feeling? ({emotionIntensity}/10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={emotionIntensity}
                  onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
                  className="w-full"
                />
              </motion.div>
            )}
          </motion.div>
        )

      case 'reframe':
        return (
          <motion.div
            key="reframe"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white">A different perspective</h2>

            {reframe && (
              <>
                <Card className="bg-indigo-900/30 border-indigo-800/50">
                  <p className="text-indigo-200">{reframe.validation}</p>
                </Card>

                <div className="flex items-start gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">A more balanced thought:</p>
                    <p className="text-white">{reframe.balanced}</p>
                  </div>
                </div>
              </>
            )}

            <Card className="mt-4">
              <p className="text-sm text-slate-400">
                This doesn't mean your original thought was wrong. It's about adding flexibility
                to your thinking, not replacing one thought with another.
              </p>
            </Card>
          </motion.div>
        )

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Well done</h2>
            <p className="text-slate-300 max-w-xs mx-auto">
              You've taken time to examine your thoughts. This record has been saved
              to your journal.
            </p>
            <Button variant="primary" onClick={onComplete}>
              Continue
            </Button>
          </motion.div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col z-40">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-slate-400 text-sm">
          Thought Helper
        </span>
        <div className="w-10" />
      </div>

      {/* Progress */}
      {step !== 'complete' && (
        <div className="px-4">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500"
              animate={{
                width: step === 'situation' ? '25%'
                  : step === 'thought' ? '50%'
                  : step === 'emotion' ? '75%'
                  : '100%'
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {step !== 'complete' && (
        <div className="p-6 safe-bottom flex gap-3">
          {step !== 'situation' && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            loading={isLoading}
            className="flex-1"
          >
            {step === 'reframe' ? 'Save' : 'Next'}
            {!isLoading && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </div>
      )}
    </div>
  )
}
