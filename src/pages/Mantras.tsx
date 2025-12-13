import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Button, Card } from '../components/common'
import { defaultMantras, getMantraText, getRandomMantra } from '../utils/defaultMantras'
import { getDeviceLanguage } from '../utils/language'

export function Mantras() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const lang = getDeviceLanguage()

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorite_mantras')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }, [])

  // Save favorites to localStorage
  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id]
    setFavorites(newFavorites)
    localStorage.setItem('favorite_mantras', JSON.stringify(newFavorites))
  }

  const currentMantra = defaultMantras[currentIndex]

  const handlePrevious = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? defaultMantras.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === defaultMantras.length - 1 ? 0 : prev + 1))
  }

  const handleRandom = () => {
    const randomMantra = getRandomMantra()
    const newIndex = defaultMantras.findIndex(m => m.id === randomMantra.id)
    setDirection(newIndex > currentIndex ? 1 : -1)
    setCurrentIndex(newIndex)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-warm-900 mb-2">
          {lang === 'ro' ? 'Mantre' : 'Mantras'}
        </h1>
        <p className="text-warm-900/60">
          {lang === 'ro'
            ? 'Repetă în minte pentru a te calma'
            : 'Repeat in your mind to calm down'}
        </p>
      </div>

      {/* Main mantra card */}
      <div className="relative h-64 mb-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <Card className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-warm-100 to-warm-200 border-warm-300">
              <motion.p
                className="text-2xl md:text-3xl font-bold text-warm-900 text-center leading-relaxed"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {getMantraText(currentMantra)}
              </motion.p>

              {/* Favorite button */}
              <motion.button
                onClick={() => toggleFavorite(currentMantra.id)}
                whileTap={{ scale: 0.9 }}
                className="mt-6 p-3 rounded-full bg-warm-50/50 hover:bg-warm-50"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    favorites.includes(currentMantra.id)
                      ? 'fill-warm-500 text-warm-500'
                      : 'text-warm-400'
                  }`}
                />
              </motion.button>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          className="p-3"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="primary"
          onClick={handleRandom}
          className="px-6"
        >
          <Shuffle className="w-5 h-5 mr-2" />
          {lang === 'ro' ? 'Aleatoriu' : 'Random'}
        </Button>

        <Button
          variant="secondary"
          onClick={handleNext}
          className="p-3"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Mantra counter */}
      <p className="text-center text-warm-900/50 text-sm mb-8">
        {currentIndex + 1} / {defaultMantras.length}
      </p>

      {/* Favorites section */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-900 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-warm-500 text-warm-500" />
            {lang === 'ro' ? 'Favorite' : 'Favorites'}
          </h2>
          <div className="space-y-2">
            {favorites.map((id) => {
              const mantra = defaultMantras.find(m => m.id === id)
              if (!mantra) return null
              return (
                <Card
                  key={id}
                  variant="interactive"
                  className="p-4"
                  onClick={() => {
                    const index = defaultMantras.findIndex(m => m.id === id)
                    setDirection(index > currentIndex ? 1 : -1)
                    setCurrentIndex(index)
                  }}
                >
                  <p className="text-warm-900 font-medium">
                    {getMantraText(mantra)}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* All mantras preview */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-warm-900">
          {lang === 'ro' ? 'Toate mantrele' : 'All mantras'}
        </h2>
        <div className="grid gap-2">
          {defaultMantras.map((mantra, index) => (
            <motion.button
              key={mantra.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`text-left p-3 rounded-xl transition-colors ${
                index === currentIndex
                  ? 'bg-warm-500 text-white'
                  : 'bg-warm-100 text-warm-900 hover:bg-warm-200'
              }`}
            >
              <span className="text-sm">
                {getMantraText(mantra)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
