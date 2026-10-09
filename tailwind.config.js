/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // v4 palette: clean white storefront, near-black ink, leaf-green accent, lavender band
        kraft: { DEFAULT: '#DCDCD6', light: '#EEEEEA', dark: '#9C9C94' },
        forest: { DEFAULT: '#1D1D1D', light: '#3A3A3A', dark: '#111111' },
        paper: '#FFFFFF',
        cream: '#F3F3F0',
        ink: '#1D1D1D',
        clay: '#4E8A2A',
        blush: { DEFAULT: '#EDE6F2', light: '#F5F1F8' },
        leaf: { DEFAULT: '#6DB33F', dark: '#4E8A2A' },
        stone: '#EAEAE4',
        sage: { DEFAULT: '#E4EBDD', mid: '#C8DCC8', deep: '#34503B' },
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        condensed: ['"Oswald"', '"Arial Narrow"', 'sans-serif'],
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
