/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        workbench: {
          900: '#0b0f19',
          850: '#0f172a',
          800: '#1e293b',
          750: '#283548',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          border: '#334155',
        },
        accent: {
          blue: '#38bdf8',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
