import { motion, AnimatePresence } from 'framer-motion'
import { getEncouragement, EncouragementType } from '../../utils/language'

interface EncouragementProps {
  show: boolean
  type: EncouragementType
  className?: string
}

export function Encouragement({ show, type, className = '' }: EncouragementProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`text-center ${className}`}
        >
          <motion.span
            className="inline-block text-2xl font-bold bg-gradient-to-r from-warm-500 to-warm-400 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            {getEncouragement(type)}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Smaller variant for inline use
export function EncouragementInline({ show, type, className = '' }: EncouragementProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={`text-warm-500 font-medium ${className}`}
        >
          {getEncouragement(type)}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
