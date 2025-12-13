import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Clock, Check, Calendar } from 'lucide-react'
import { Button, Card } from '../common'
import { useAppStore, useHaptic } from '../../stores/appStore'
import { addPostponedWorry } from '../../db'

interface WorryPostponementProps {
  onComplete: () => void
  onCancel: () => void
}

export function WorryPostponement({ onComplete, onCancel }: WorryPostponementProps) {
  const [worry, setWorry] = useState('')
  const [selectedTime, setSelectedTime] = useState<'later' | 'tomorrow' | 'custom'>('later')
  const [saved, setSaved] = useState(false)
  const addToolUsed = useAppStore(state => state.addToolUsed)
  const haptic = useHaptic()

  const getScheduledTime = (): Date => {
    const now = new Date()
    switch (selectedTime) {
      case 'later':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
      case 'tomorrow':
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(10, 0, 0, 0) // 10 AM tomorrow
        return tomorrow
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    }
  }

  const handleSave = async () => {
    if (!worry.trim()) return

    const scheduledFor = getScheduledTime()
    await addPostponedWorry(worry, scheduledFor)
    addToolUsed('Worry postponement')
    haptic.medium()
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="fixed inset-0 bg-warm-50 flex flex-col items-center justify-center px-6 z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-warm-700/20 flex items-center justify-center">
            <Check className="w-12 h-12 text-warm-700" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900">Worry saved for later</h2>
          <p className="text-warm-900/70 max-w-xs">
            You've acknowledged this worry and set aside time to think about it.
            For now, you can let it go.
          </p>
          <Card className="text-left">
            <p className="text-sm text-warm-900/60 mb-1">Scheduled for:</p>
            <p className="text-warm-900 font-medium">
              {selectedTime === 'later' ? 'In 2 hours' : selectedTime === 'tomorrow' ? 'Tomorrow at 10 AM' : 'Later'}
            </p>
          </Card>
          <Button variant="primary" onClick={onComplete}>
            Continue
          </Button>
        </motion.div>
      </div>
    )
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
          Worry Postponement
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {/* Explanation */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-warm-900 mb-2">
            Save this worry for later
          </h1>
          <p className="text-warm-900/60">
            Write down what's worrying you. We'll remind you to think about it at a better time,
            when you're feeling calmer and can approach it with a clearer mind.
          </p>
        </div>

        {/* Worry input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-warm-900/80 mb-2">
            What's on your mind?
          </label>
          <textarea
            value={worry}
            onChange={(e) => setWorry(e.target.value)}
            placeholder="Write your worry here..."
            className="w-full h-32 bg-warm-100 border border-warm-200 rounded-xl p-4 text-warm-900 placeholder-warm-900/40 focus:outline-none focus:ring-2 focus:ring-warm-500 resize-none"
          />
        </div>

        {/* Time selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-warm-900/80 mb-3">
            When should we revisit this?
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedTime('later')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                selectedTime === 'later'
                  ? 'bg-warm-500 text-white'
                  : 'bg-warm-100 text-warm-900 hover:bg-warm-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Later today</div>
                <div className="text-sm opacity-70">In about 2 hours</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedTime('tomorrow')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                selectedTime === 'tomorrow'
                  ? 'bg-warm-500 text-white'
                  : 'bg-warm-100 text-warm-900 hover:bg-warm-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Tomorrow morning</div>
                <div className="text-sm opacity-70">At 10:00 AM</div>
              </div>
            </button>
          </div>
        </div>

        {/* Tip */}
        <Card className="bg-warm-500/10 border-warm-500/30">
          <p className="text-sm text-warm-900/80">
            <strong>Why this helps:</strong> Worrying rarely solves problems in the moment.
            By scheduling "worry time," you acknowledge the concern without letting it
            control your present moment.
          </p>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-6 safe-bottom space-y-3">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!worry.trim()}
          className="w-full"
        >
          Save worry for later
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          Not now
        </Button>
      </div>
    </div>
  )
}
