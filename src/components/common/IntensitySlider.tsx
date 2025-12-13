import { useState } from 'react'
import { motion } from 'framer-motion'

interface IntensitySliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
}

const intensityLabels = [
  { value: 0, label: 'Calm', color: 'from-green-400 to-green-500' },
  { value: 1, label: 'Minimal', color: 'from-green-400 to-emerald-500' },
  { value: 2, label: 'Mild', color: 'from-emerald-400 to-teal-500' },
  { value: 3, label: 'Slight', color: 'from-teal-400 to-cyan-500' },
  { value: 4, label: 'Noticeable', color: 'from-cyan-400 to-sky-500' },
  { value: 5, label: 'Moderate', color: 'from-sky-400 to-blue-500' },
  { value: 6, label: 'Significant', color: 'from-blue-400 to-indigo-500' },
  { value: 7, label: 'High', color: 'from-indigo-400 to-violet-500' },
  { value: 8, label: 'Very High', color: 'from-violet-400 to-purple-500' },
  { value: 9, label: 'Intense', color: 'from-purple-400 to-fuchsia-500' },
  { value: 10, label: 'Extreme', color: 'from-fuchsia-400 to-pink-500' }
]

export function IntensitySlider({ value, onChange, label = 'How intense is your anxiety right now?' }: IntensitySliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const currentIntensity = intensityLabels[value]

  return (
    <div className="w-full space-y-4">
      <label className="block text-lg font-medium text-slate-200">
        {label}
      </label>

      <div className="relative">
        {/* Track */}
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${currentIntensity.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${value * 10}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Slider input */}
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb indicator */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg ${isDragging ? 'scale-125' : ''}`}
          style={{ left: `calc(${value * 10}% - 12px)` }}
          animate={{ scale: isDragging ? 1.25 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Value display */}
      <div className="flex justify-between items-center">
        <span className="text-3xl font-bold text-white">{value}</span>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-lg font-medium bg-gradient-to-r ${currentIntensity.color} bg-clip-text text-transparent`}
        >
          {currentIntensity.label}
        </motion.span>
      </div>

      {/* Quick select buttons */}
      <div className="flex justify-between gap-1">
        {[0, 2, 4, 6, 8, 10].map((num) => (
          <motion.button
            key={num}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(num)}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
              value === num
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
