/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14171F',
        surface: '#1B1F29',
        surfaceAlt: '#232838',
        paper: '#ECE7DD',
        sage: '#4F8C7A',
        sageDeep: '#3B6C5D',
        ember: '#E4A853',
        rose: '#C4685A',
        muted: '#8B90A0',
        hair: 'rgba(231,228,218,0.08)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
