/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // v3 palette: warm cream, espresso ink, terracotta accent, blush and sage tints
        kraft: { DEFAULT: '#E3A792', light: '#F6DCD2', dark: '#B9735C' },
        forest: { DEFAULT: '#2A211C', light: '#45372E', dark: '#231B16' },
        paper: '#FBF8F2',
        cream: '#F6F0E6',
        ink: '#2A211C',
        clay: '#D27D62',
        blush: { DEFAULT: '#F8DAD4', light: '#FCEDEA' },
        sage: { DEFAULT: '#E4EBDD', mid: '#C8DCC8', deep: '#34503B' },
      },
      fontFamily: {
        display: ['"Inter Tight"', '"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        grow: { from: { width: '0%' }, to: { width: '100%' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
