import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', onClick, ...props }, ref) => {
    const baseStyles = 'rounded-2xl border border-slate-700/50'

    const variants = {
      default: 'bg-slate-800/50 backdrop-blur-sm',
      elevated: 'bg-slate-800 shadow-lg shadow-black/20',
      interactive: 'bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 active:bg-slate-700 cursor-pointer transition-colors'
    }

    const paddings = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    }

    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref}
          whileTap={{ scale: 0.98 }}
          className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
          onClick={onClick}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
