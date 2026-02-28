/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0B1D3A',
          mid: '#0f2347',
          light: '#1a3260',
        },
        brand: {
          teal: '#0D9488',
          'teal-light': '#14b8a8',
          'teal-dim': '#0a7a70',
          orange: '#E8710A',
          'orange-light': '#f59332',
          'orange-dim': '#b85a08',
        },
      },
      backgroundImage: {
        mesh: `
          radial-gradient(ellipse 70% 55% at 10% 15%, rgba(13,148,136,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 90% 85%, rgba(220,38,38,0.11) 0%, transparent 55%),
          radial-gradient(ellipse 45% 40% at 85% 10%, rgba(232,113,10,0.09) 0%, transparent 50%)
        `,
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        spin: 'spin 0.7s linear infinite',
        'fade-up': 'fadeUp 0.3s ease both',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}
