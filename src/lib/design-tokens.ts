export const DESIGN_TOKENS = {
  colors: {
    primary: '#1A56DB',
    primaryBg: '#EBF0FF',
    darkBg: '#0F172A',
    cardDark: '#1E293B',
    border: {
      light: '#E2E8F0',
      dark: '#334155',
    },
    mutedText: '#64748B',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  },
  typography: {
    font: 'Inter',
    display: 'font-bold tracking-tight',
    body: 'font-normal leading-relaxed',
  },
  radius: {
    card: 'rounded-xl',
    button: 'rounded-lg',
    badge: 'rounded-full',
  },
} as const;
