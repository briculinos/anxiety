import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Hand, Brain, Clock, Dumbbell, ChevronRight, ChevronLeft, AlertCircle, X } from 'lucide-react'
import { Button, Card, IntensitySlider, Chip } from '../components/common'
import { BoxBreathing, PacedBreathing, PhysiologicalSigh } from '../components/breathing'
import { FiveFourThreeGrounding } from '../components/grounding'
import { MuscleRelaxation, WorryPostponement, ThoughtHelper } from '../components/exercises'
import { CrisisScreen } from '../components/CrisisScreen'
import { useAppStore } from '../stores/appStore'
import { logEpisode } from '../db'
import { triageUser } from '../agents/gemini'
import { DEFAULT_TRIGGERS, DEFAULT_SYMPTOMS } from '../types'

type ActiveExercise = 'box' | 'paced' | 'sigh' | 'grounding' | 'muscle' | 'worry' | 'thought' | null
type FlowStep = 'home' | 'intensity' | 'symptoms' | 'tools' | 'complete'

const quickTools = [
  { id: 'box', name: 'Box Breathing', icon: Wind, description: '4-4-4-4 pattern' },
  { id: 'paced', name: 'Paced Breathing', icon: Wind, description: 'Long exhales' },
  { id: 'sigh', name: 'Physiological Sigh', icon: Wind, description: 'Fast relief' },
  { id: 'grounding', name: '5-4-3-2-1', icon: Hand, description: 'Use your senses' },
  { id: 'muscle', name: 'Muscle Relaxation', icon: Dumbbell, description: 'Release tension' },
  { id: 'thought', name: 'Thought Helper', icon: Brain, description: 'Reframe worries' },
  { id: 'worry', name: 'Postpone Worry', icon: Clock, description: 'Save for later' }
]

export function Home() {
  const { setFlowState, currentEpisode, startEpisode, addTrigger, removeTrigger, addSymptom, removeSymptom, addToolUsed, endEpisode, showCrisisScreen, setShowCrisisScreen } = useAppStore()

  const [flowStep, setFlowStep] = useState<FlowStep>('home')
  const [activeExercise, setActiveExercise] = useState<ActiveExercise>(null)
  const [intensity, setIntensity] = useState(5)
  const [isTriaging, setIsTriaging] = useState(false)

  // Handle panic button press
  const handlePanicPress = () => {
    setFlowStep('intensity')
    setFlowState('assessing')
  }

  // Handle intensity submission
  const handleIntensitySubmit = async () => {
    setIsTriaging(true)
    startEpisode(intensity)

    try {
      // Run triage
      const result = await triageUser(
        intensity,
        currentEpisode?.symptoms || [],
        currentEpisode?.triggers || []
      )

      if (result.isCrisis) {
        setShowCrisisScreen(true)
        setIsTriaging(false)
        return
      }

      // For high intensity, go straight to tools
      if (intensity >= 7) {
        setFlowStep('tools')
        setFlowState('breathing')
      } else {
        setFlowStep('symptoms')
      }
    } catch {
      // Fallback - continue anyway
      setFlowStep('symptoms')
    }
    setIsTriaging(false)
  }

  // Handle going back
  const handleBack = () => {
    if (flowStep === 'intensity') {
      setFlowStep('home')
      setFlowState('idle')
    } else if (flowStep === 'symptoms') {
      setFlowStep('intensity')
    } else if (flowStep === 'tools') {
      setFlowStep('symptoms')
    }
  }

  // Handle cancel (go back to home)
  const handleCancel = () => {
    endEpisode()
    setFlowStep('home')
    setFlowState('idle')
    setIntensity(5)
  }

  // Handle symptom step completion
  const handleSymptomsNext = () => {
    setFlowStep('tools')
    setFlowState('breathing')
  }

  // Handle exercise start
  const handleStartExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId as ActiveExercise)
    addToolUsed(quickTools.find(t => t.id === exerciseId)?.name || exerciseId)
  }

  // Handle exercise completion
  const handleExerciseComplete = () => {
    setActiveExercise(null)
    // Stay on tools page so they can try another or finish
  }

  // Handle flow completion
  const handleFinish = async () => {
    const episode = endEpisode()
    if (episode) {
      // Calculate duration
      const durationMinutes = Math.round(
        (new Date().getTime() - episode.startTime.getTime()) / 60000
      )

      await logEpisode({
        timestamp: episode.startTime,
        intensity: episode.intensity,
        durationMinutes,
        triggers: episode.triggers,
        symptoms: episode.symptoms,
        toolsUsed: episode.toolsUsed
      })
    }

    setFlowStep('complete')
    setFlowState('complete')

    // Reset after showing complete screen
    setTimeout(() => {
      setFlowStep('home')
      setFlowState('idle')
      setIntensity(5)
    }, 3000)
  }

  // Render active exercise
  if (activeExercise) {
    const handleCancel = () => setActiveExercise(null)

    switch (activeExercise) {
      case 'box':
        return <BoxBreathing onComplete={handleExerciseComplete} onCancel={handleCancel} />
      case 'paced':
        return <PacedBreathing onComplete={handleExerciseComplete} onCancel={handleCancel} />
      case 'sigh':
        return <PhysiologicalSigh onComplete={handleExerciseComplete} onCancel={handleCancel} />
      case 'grounding':
        return <FiveFourThreeGrounding onComplete={handleExerciseComplete} onCancel={handleCancel} />
      case 'muscle':
        return <MuscleRelaxation onComplete={handleExerciseComplete} onCancel={handleCancel} />
      case 'worry':
        return <WorryPostponement onComplete={handleExerciseComplete} onCancel={handleCancel} />
      case 'thought':
        return <ThoughtHelper onComplete={handleExerciseComplete} onCancel={handleCancel} />
    }
  }

  // Render crisis screen
  if (showCrisisScreen) {
    return <CrisisScreen />
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <AnimatePresence mode="wait">
        {/* Home state - show panic button */}
        {flowStep === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[80vh]"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-white mb-2">Calm Companion</h1>
              <p className="text-slate-400">Here when you need support</p>
            </div>

            {/* Main panic button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePanicPress}
              className="w-64 h-64 rounded-full btn-panic text-2xl font-semibold flex flex-col items-center justify-center gap-2"
            >
              <span className="text-4xl">I feel anxious</span>
              <span className="text-lg opacity-80">Tap for support</span>
            </motion.button>

            {/* Quick access tools */}
            <div className="mt-12 w-full max-w-sm">
              <p className="text-sm text-slate-400 text-center mb-4">Quick tools</p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickTools.slice(0, 4).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleStartExercise(tool.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm text-slate-300 transition-colors"
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Intensity assessment */}
        {flowStep === 'intensity' && (
          <motion.div
            key="intensity"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-8"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleCancel}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Let's check in</h1>
                <p className="text-slate-400 text-sm">Take a breath. You're here, and that's a good step.</p>
              </div>
            </div>

            <IntensitySlider value={intensity} onChange={setIntensity} />

            <div className="mt-8">
              <Button
                variant="primary"
                onClick={handleIntensitySubmit}
                loading={isTriaging}
                className="w-full"
                size="lg"
              >
                {isTriaging ? 'Finding support...' : 'Continue'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {intensity >= 8 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card className="bg-amber-900/30 border-amber-800/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200">
                      This feels intense. We'll get you to a calming exercise right away.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Symptoms selection (optional) */}
        {flowStep === 'symptoms' && (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-8"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBack}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">What are you noticing?</h1>
                <p className="text-slate-400 text-sm">Tap any that apply (optional)</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Symptoms */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">Physical feelings</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SYMPTOMS.map((symptom) => (
                    <Chip
                      key={symptom}
                      selected={currentEpisode?.symptoms.includes(symptom)}
                      onClick={() =>
                        currentEpisode?.symptoms.includes(symptom)
                          ? removeSymptom(symptom)
                          : addSymptom(symptom)
                      }
                    >
                      {symptom}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">What triggered this?</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_TRIGGERS.map((trigger) => (
                    <Chip
                      key={trigger}
                      selected={currentEpisode?.triggers.includes(trigger)}
                      onClick={() =>
                        currentEpisode?.triggers.includes(trigger)
                          ? removeTrigger(trigger)
                          : addTrigger(trigger)
                      }
                    >
                      {trigger}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="secondary" onClick={handleSymptomsNext} className="flex-1">
                Skip
              </Button>
              <Button variant="primary" onClick={handleSymptomsNext} className="flex-1">
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tools selection */}
        {flowStep === 'tools' && (
          <motion.div
            key="tools"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="py-8"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBack}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Choose a tool</h1>
                <p className="text-slate-400 text-sm">
                  {intensity >= 7
                    ? 'Let\'s calm your body first. Try breathing or grounding.'
                    : 'Pick what feels right for you.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {quickTools.map((tool, i) => {
                const Icon = tool.icon
                // Highlight recommended tools for high anxiety
                const isRecommended = intensity >= 7 && ['box', 'sigh', 'grounding'].includes(tool.id)

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      variant="interactive"
                      onClick={() => handleStartExercise(tool.id)}
                      className={isRecommended ? 'ring-2 ring-indigo-500' : ''}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isRecommended ? 'bg-indigo-500/20' : 'bg-slate-700'
                        }`}>
                          <Icon className={`w-6 h-6 ${isRecommended ? 'text-indigo-400' : 'text-slate-300'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{tool.name}</span>
                            {isRecommended && (
                              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-slate-400">{tool.description}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-8">
              <Button variant="secondary" onClick={handleFinish} className="w-full">
                I'm feeling better, finish
              </Button>
            </div>
          </motion.div>
        )}

        {/* Complete */}
        {flowStep === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[80vh] text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-4xl"
              >
                ✓
              </motion.div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Great job</h1>
            <p className="text-slate-400 max-w-xs">
              You took care of yourself. This moment has been saved.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
