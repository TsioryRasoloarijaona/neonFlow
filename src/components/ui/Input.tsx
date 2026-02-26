import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-[#1F2937] dark:text-[#E6EDF3]">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] flex items-center justify-center">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full h-[40px] ${icon ? 'pl-10 pr-3' : 'px-3'}
              bg-white dark:bg-[#161B22]
              border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]
              rounded-md
              text-sm text-[#1F2937] dark:text-[#E6EDF3]
              placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]
              focus:outline-none 
              focus:ring-2 focus:ring-[rgba(37,99,235,0.4)] dark:focus:ring-[rgba(59,130,246,0.4)]
              focus:border-[#2563EB] dark:focus:border-[#3B82F6]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-[#DC2626] dark:border-[#EF4444] focus:ring-red-500/40' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        
        {error && (
          <span className="text-xs text-[#DC2626] dark:text-[#EF4444]">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

