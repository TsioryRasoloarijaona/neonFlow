import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  disabled?: boolean
}

const variants = {
  primary: `
    bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF]
    dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] dark:active:bg-[#93C5FD]
    text-white font-medium
    border border-transparent
    shadow-sm hover:shadow-md
    transition-all duration-200
  `,
  secondary: `
    bg-[#F9FAFB] hover:bg-[#F1F3F7] active:bg-[#E5E7EB]
    dark:bg-[#1C2128] dark:hover:bg-[#21262D] dark:active:bg-[#2D333B]
    text-[#1F2937] dark:text-[#E6EDF3]
    border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
    transition-all duration-200
  `,
  ghost: `
    bg-transparent hover:bg-[#F9FAFB] active:bg-[#F1F3F7]
    dark:hover:bg-[#1C2128] dark:active:bg-[#21262D]
    text-[#6B7280] dark:text-[#9CA3AF]
    hover:text-[#1F2937] dark:hover:text-[#E6EDF3]
    border border-transparent
    transition-all duration-200
  `,
  danger: `
    bg-[#FEF2F2] hover:bg-[#FEE2E2] active:bg-[#FECACA]
    dark:bg-[rgba(239,68,68,0.1)] dark:hover:bg-[rgba(239,68,68,0.15)] dark:active:bg-[rgba(239,68,68,0.2)]
    text-[#DC2626] dark:text-[#EF4444]
    border border-[rgba(220,38,38,0.2)] dark:border-[rgba(239,68,68,0.2)]
    transition-all duration-200
  `
}

const sizes = {
  sm: 'h-[32px] px-3 text-sm',
  md: 'h-[40px] px-4 text-sm',
  lg: 'h-[48px] px-6 text-base'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-md
        inline-flex items-center justify-center gap-2
        font-medium
        focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current
        whitespace-nowrap
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  )
}

