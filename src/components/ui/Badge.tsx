import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  default: `
    bg-[#F9FAFB] dark:bg-[#1C2128]
    text-[#6B7280] dark:text-[#9CA3AF]
    border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
  `,
  success: `
    bg-[#F0FDF4] dark:bg-[rgba(34,197,94,0.1)]
    text-[#16A34A] dark:text-[#22C55E]
    border border-[rgba(22,163,74,0.2)] dark:border-[rgba(34,197,94,0.2)]
  `,
  warning: `
    bg-[#FFFBEB] dark:bg-[rgba(251,191,36,0.1)]
    text-[#F59E0B] dark:text-[#FBBF24]
    border border-[rgba(245,158,11,0.2)] dark:border-[rgba(251,191,36,0.2)]
  `,
  danger: `
    bg-[#FEF2F2] dark:bg-[rgba(239,68,68,0.1)]
    text-[#DC2626] dark:text-[#EF4444]
    border border-[rgba(220,38,38,0.2)] dark:border-[rgba(239,68,68,0.2)]
  `,
  info: `
    bg-[#EFF6FF] dark:bg-[rgba(96,165,250,0.1)]
    text-[#3B82F6] dark:text-[#60A5FA]
    border border-[rgba(59,130,246,0.2)] dark:border-[rgba(96,165,250,0.2)]
  `
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm'
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium
        rounded-md
        whitespace-nowrap
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

