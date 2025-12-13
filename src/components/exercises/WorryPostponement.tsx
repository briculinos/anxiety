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
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center px-6 z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Worry saved for later</h2>
          <p className="text-slate-300 max-w-xs">
            You've acknowledged this worry and set aside time to think about it.
            For now, you can let it go.
          </p>
          <Card className="text-left">
            <p className="text-sm text-slate-400 mb-1">Scheduled for:</p>
            <p className="text-white font-medium">
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
          Worry Postponement
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {/* Explanation */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Save this worry for later
          </h1>
          <p className="text-slate-400">
            Write down what's worrying you. We'll remind you to think about it at a better time,
            when you're feeling calmer and can approach it with a clearer mind.
          </p>
        </div>

        {/* Worry input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            What's on your mind?
          </label>
          <textarea
            value={worry}
            onChange={(e) => setWorry(e.target.value)}
            placeholder="Write your worry here..."
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Time selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            When should we revisit this?
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedTime('later')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                selectedTime === 'later'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
        <Card className="bg-indigo-900/30 border-indigo-800/50">
          <p className="text-sm text-indigo-200">
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
