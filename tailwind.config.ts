import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        'roboto': ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        'noto-sans-sc': ['var(--font-noto-sans-sc)', 'system-ui', 'sans-serif'],
        'noto-sans-devanagari': ['var(--font-noto-sans-devanagari)', 'system-ui', 'sans-serif'],
        'noto-sans-bengali': ['var(--font-noto-sans-bengali)', 'system-ui', 'sans-serif'],
        'noto-sans-jp': ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
        'noto-sans-kr': ['var(--font-noto-sans-kr)', 'system-ui', 'sans-serif'],
        'noto-sans-thai': ['var(--font-noto-sans-thai)', 'system-ui', 'sans-serif'],
        'noto-sans-telugu': ['var(--font-noto-sans-telugu)', 'system-ui', 'sans-serif'],
        'noto-sans-tamil': ['var(--font-noto-sans-tamil)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    typography,
  ],
}

export default config 