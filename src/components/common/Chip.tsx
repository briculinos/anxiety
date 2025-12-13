import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  selected?: boolean
  size?: 'sm' | 'md'
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, size = 'md', children, className = '', onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full font-medium transition-colors duration-150 touch-manipulation cursor-pointer'

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm'
    }

    const selectedStyles = selected
      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
      : 'bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500'

    return (
      <motion.button
        ref={ref}
        type="button"
        whileTap={{ scale: 0.95 }}
        className={`${baseStyles} ${sizes[size]} ${selectedStyles} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Chip.displayName = 'Chip'
