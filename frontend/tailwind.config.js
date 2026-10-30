/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#54245F',
          dark: '#3d1846',
          light: '#6d317a'
        },
        empowerment: {
          purple: '#7542A6',
          light: '#915ec4',
          dark: '#582d82'
        },
        coral: {
          DEFAULT: '#E88979',
          light: '#f1aba0',
          dark: '#d16a57'
        },
        blush: {
          DEFAULT: '#F9E8ED',
          dark: '#ebd0d9'
        },
        cream: {
          DEFAULT: '#FFF9F4',
          card: '#FFFFFF'
        },
        charcoal: {
          DEFAULT: '#28242C',
          light: '#3e3844',
          muted: '#625b6a'
        },
        success: {
          DEFAULT: '#269B72',
          light: '#35be8d',
          dark: '#1b7756'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'Manrope', 'sans-serif']
      }
    },
  },
  plugins: [],
}
