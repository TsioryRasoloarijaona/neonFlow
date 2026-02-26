import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
}

export function PageContainer({
  children,
  title,
  subtitle,
  actions,
  maxWidth = 'xl',
  className = ''
}: PageContainerProps) {
  return (
    <div className={`w-full ${maxWidths[maxWidth]} mx-auto space-y-6 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          {(title || subtitle) && (
            <div className="space-y-1">
              {title && (
                <h1 className="text-2xl font-semibold text-[#1F2937] dark:text-[#E6EDF3]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
