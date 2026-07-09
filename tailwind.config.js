/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A5276',
        success: '#1E8449',
        warning: '#CA6F1E',
        danger: '#C0392B',
        background: '#F8F9FA',
      },
    },
  },
  plugins: [],
}
