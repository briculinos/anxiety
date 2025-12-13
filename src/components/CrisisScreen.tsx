import { motion } from 'framer-motion'
import { Phone, MessageCircle, Heart, ArrowLeft } from 'lucide-react'
import { Button } from './common'
import { useAppStore } from '../stores/appStore'
import { handleCrisisScreenShown } from '../utils/safety'
import { DEFAULT_EMERGENCY_RESOURCES } from '../utils/safety'
import { useEffect } from 'react'

export function CrisisScreen() {
  const setShowCrisisScreen = useAppStore(state => state.setShowCrisisScreen)

  useEffect(() => {
    handleCrisisScreenShown()
  }, [])

  const handleBack = () => {
    setShowCrisisScreen(false)
  }

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-pink-500/20 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-pink-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            You're not alone
          </h1>
          <p className="text-slate-300 max-w-sm">
            It sounds like you're going through something really difficult right now.
            Please reach out to someone who can help.
          </p>
        </motion.div>

        {/* Crisis resources */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* US Resources */}
          <div className="bg-slate-800/50 rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold text-white">Crisis Support</h2>

            <button
              onClick={() => handleCall(DEFAULT_EMERGENCY_RESOURCES.US.crisis)}
              className="w-full flex items-center gap-4 p-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Call 988</div>
                <div className="text-sm text-indigo-200">Suicide & Crisis Lifeline</div>
              </div>
            </button>

            <button
              onClick={() => window.open('sms:741741?body=HOME', '_blank')}
              className="w-full flex items-center gap-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Text HOME to 741741</div>
                <div className="text-sm text-slate-300">Crisis Text Line</div>
              </div>
            </button>
          </div>

          {/* Emergency */}
          <div className="bg-red-900/30 border border-red-800/50 rounded-2xl p-4">
            <p className="text-sm text-red-200 mb-3">
              If you're in immediate danger or having a medical emergency:
            </p>
            <button
              onClick={() => handleCall('911')}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-white transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call 911
            </button>
          </div>
        </motion.div>

        {/* Grounding message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2 max-w-sm"
        >
          <p className="text-slate-400 text-sm">
            While you wait or if you can't call right now, try taking slow, deep breaths.
            You matter, and this moment will pass.
          </p>
        </motion.div>
      </div>

      {/* Back button */}
      <div className="p-6 safe-bottom">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-full"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          I'm safe, go back
        </Button>
      </div>
    </motion.div>
  )
}
