/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kraft: { DEFAULT: '#C9A57B', light: '#E6D3B8', dark: '#9C7A52' },
        forest: { DEFAULT: '#1F3D2B', light: '#2E5A40', dark: '#142A1D' },
        paper: '#F7F3EC',
        ink: '#1B1B18',
        clay: '#C2552E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
