import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', onClick, ...props }, ref) => {
    const baseStyles = 'rounded-2xl border border-warm-200'

    const variants = {
      default: 'bg-warm-100',
      elevated: 'bg-warm-100 shadow-lg shadow-warm-900/10',
      interactive: 'bg-warm-100 hover:bg-warm-200 active:bg-warm-200 cursor-pointer transition-colors'
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
