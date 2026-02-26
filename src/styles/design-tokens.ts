/**
 * Design System Tokens
 * Professional SaaS UI inspired by Jira, Linear, Notion
 */

export const designTokens = {
  // 🎨 Colors
  colors: {
    light: {
      background: '#F7F8FA',
      surface: '#FFFFFF',
      surfaceHover: '#F9FAFB',
      surfaceActive: '#F1F3F7',
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      primaryActive: '#1E40AF',
      secondary: '#6B7280',
      secondaryHover: '#4B5563',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(0, 0, 0, 0.12)',
      divider: 'rgba(0, 0, 0, 0.06)',
      success: '#16A34A',
      successBg: '#F0FDF4',
      warning: '#F59E0B',
      warningBg: '#FFFBEB',
      danger: '#DC2626',
      dangerBg: '#FEF2F2',
      info: '#3B82F6',
      infoBg: '#EFF6FF',
    },
    dark: {
      background: '#0D1117',
      surface: '#161B22',
      surfaceHover: '#1C2128',
      surfaceActive: '#21262D',
      primary: '#3B82F6',
      primaryHover: '#60A5FA',
      primaryActive: '#93C5FD',
      secondary: '#9CA3AF',
      secondaryHover: '#D1D5DB',
      textPrimary: '#E6EDF3',
      textSecondary: '#9CA3AF',
      textTertiary: '#6B7280',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.12)',
      divider: 'rgba(255, 255, 255, 0.06)',
      success: '#22C55E',
      successBg: 'rgba(34, 197, 94, 0.1)',
      warning: '#FBBF24',
      warningBg: 'rgba(251, 191, 36, 0.1)',
      danger: '#EF4444',
      dangerBg: 'rgba(239, 68, 68, 0.1)',
      info: '#60A5FA',
      infoBg: 'rgba(96, 165, 250, 0.1)',
    },
  },

  // 📏 Spacing (8px system)
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  // 🔲 Border Radius
  radius: {
    none: '0',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // 🌫️ Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // 🔤 Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
      base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
      '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // 🎯 Component Sizes
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '0 12px',
        md: '0 16px',
        lg: '0 24px',
      },
      radius: '8px',
    },
    input: {
      height: '40px',
      padding: '0 12px',
      radius: '8px',
    },
    card: {
      padding: '16px',
      radius: '12px',
    },
    modal: {
      radius: '16px',
      padding: '24px',
    },
    sidebar: {
      width: '240px',
      itemHeight: '40px',
      radius: '0',
    },
  },

  // 🎭 Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // 🎨 Focus Ring
  focus: {
    ring: '2px solid',
    ringColor: 'rgba(37, 99, 235, 0.4)',
    ringColorDark: 'rgba(59, 130, 246, 0.4)',
    offset: '2px',
  },

  // 📐 Z-Index
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    toast: 1200,
    tooltip: 1300,
  },
} as const

export type DesignTokens = typeof designTokens
