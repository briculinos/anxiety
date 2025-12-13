import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, X, Waves, CloudRain, TreePine, Music } from 'lucide-react'
import { useAmbientSound, SoundType, soundLabels } from '../../hooks/useAmbientSound'
import { getDeviceLanguage } from '../../utils/language'
import { useAppStore } from '../../stores/appStore'

const soundIcons: Record<Exclude<SoundType, null>, React.ElementType> = {
  waves: Waves,
  rain: CloudRain,
  forest: TreePine,
  music: Music
}

export function SoundControl() {
  const [isOpen, setIsOpen] = useState(false)
  const { isPlaying, currentSound, volume, play, stop, setVolume } = useAmbientSound()
  const flowState = useAppStore(state => state.flowState)
  const lang = getDeviceLanguage()

  // Hide during active flows
  if (flowState !== 'idle' && flowState !== 'complete') {
    return null
  }

  const handleSoundSelect = (sound: Exclude<SoundType, null>) => {
    if (currentSound === sound && isPlaying) {
      stop()
    } else {
      play(sound)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-warm-500 text-white shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isPlaying ? [1, 1.05, 1] : 1
        }}
        transition={{
          repeat: isPlaying ? Infinity : 0,
          duration: 2
        }}
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </motion.button>

      {/* Sound picker modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-warm-900/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-40 right-4 z-50 w-72 bg-warm-50 rounded-2xl shadow-xl border border-warm-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-warm-200">
                <h3 className="font-semibold text-warm-900">
                  {lang === 'ro' ? 'Sunete ambientale' : 'Ambient Sounds'}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-warm-100"
                >
                  <X className="w-5 h-5 text-warm-900/60" />
                </button>
              </div>

              {/* Sound options */}
              <div className="p-4 space-y-2">
                {(Object.keys(soundIcons) as Array<Exclude<SoundType, null>>).map((sound) => {
                  const Icon = soundIcons[sound]
                  const isActive = currentSound === sound && isPlaying
                  return (
                    <motion.button
                      key={sound}
                      onClick={() => handleSoundSelect(sound)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-warm-500 text-white'
                          : 'bg-warm-100 text-warm-900 hover:bg-warm-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">
                        {soundLabels[sound][lang]}
                      </span>
                      {isActive && (
                        <motion.div
                          className="ml-auto flex gap-0.5"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <div className="w-1 h-3 bg-white rounded-full" />
                          <div className="w-1 h-4 bg-white rounded-full" />
                          <div className="w-1 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Volume slider */}
              {isPlaying && (
                <div className="px-4 pb-4">
                  <label className="text-sm text-warm-900/60 mb-2 block">
                    {lang === 'ro' ? 'Volum' : 'Volume'}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-warm-500"
                  />
                </div>
              )}

              {/* Stop button */}
              {isPlaying && (
                <div className="px-4 pb-4">
                  <button
                    onClick={stop}
                    className="w-full py-2 text-warm-500 hover:text-warm-600 font-medium"
                  >
                    {lang === 'ro' ? 'Oprește sunetul' : 'Stop sound'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
