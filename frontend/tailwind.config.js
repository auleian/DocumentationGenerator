/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: '#FAF8F4',
        brand: {
          50: '#EFF6F5',
          100: '#D7E9E7',
          200: '#B0D3CE',
          300: '#82B7AF',
          400: '#579C92',
          500: '#357F74',
          600: '#26665D',
          700: '#1E524B',
          800: '#193F3A',
          900: '#122E2B',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        card: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
