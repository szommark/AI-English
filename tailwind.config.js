/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['"Patrick Hand"', 'cursive'],
        // Grammar Coach board text: Lexend is designed for easy reading.
        board: ['Lexend', 'system-ui', 'sans-serif'],
        brand: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Club palette retune (see src/index.css): older screens use slate for neutrals and
        // indigo for buttons and links, so both scales are redrawn instead of editing every
        // class. "slate" is a warm grey with a hint of green, "indigo" is the club green.
        slate: {
          50: '#f9f7f1',
          100: '#f2eee3',
          200: '#e6dfcc',
          300: '#d1c8b1',
          400: '#9a9584',
          500: '#6d6b5e',
          600: '#525449',
          700: '#3d443c',
          800: '#26302b',
          900: '#18211d',
          950: '#0d1411',
        },
        indigo: {
          50: '#eef5f1',
          100: '#d8e8e0',
          200: '#b3d1c4',
          300: '#85b3a1',
          400: '#4f8c77',
          500: '#2e6b58',
          600: '#1d4a40',
          700: '#163a32',
          800: '#0f2a24',
          900: '#0b201b',
          950: '#061310',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
