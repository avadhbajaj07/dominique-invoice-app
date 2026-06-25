/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dominique's brand — sourced from config/client.ts
        brand: {
          primary: '#C17A7A',
          bg: '#FAF5F0',
          text: '#1A1A1A',
          accent: '#E8D5C4',
          light: '#F5EDE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
