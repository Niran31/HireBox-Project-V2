import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1A56DB',
          primaryBg: '#EBF0FF',
          darkBg: '#0F172A',
          cardDark: '#1E293B',
          mutedText: '#64748B',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};

export default config;
