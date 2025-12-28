/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#FFB6C1',
          mint: '#B4E7CE',
          cream: '#FFF4E0',
        },
        emotion: {
          happy: '#FFD93D',
          calm: '#A8E6CF',
          sad: '#B4C7E7',
          stressed: '#F8C8DC',
        },
        text: {
          dark: '#6B5B5B',
          light: '#9E9E9E',
        }
      },
      borderRadius: {
        'widget': '20px',
      },
      fontFamily: {
        sans: ['HarmonyOS Sans', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
