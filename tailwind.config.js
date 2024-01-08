/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mainBgColor": "#f8faf9",
        "columnBgColor":"#AAD7D9",
        "textColor":"#272727",
        "hoverColor":"#92C7CF"
      }
    },
  },
  plugins: [],
}