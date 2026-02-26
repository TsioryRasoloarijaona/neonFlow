import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  hover?: boolean
  variant?: 'default' | 'bordered'
}

export function Card({ children, hover = false, variant = 'default', className = '', ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
      className={`
        bg-white dark:bg-[#161B22]
        rounded-xl
        border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
        shadow-sm
        transition-all duration-200
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

