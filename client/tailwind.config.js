/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next", "Trebuchet MS", "ui-sans-serif", "sans-serif"],
        display: ["Georgia", "ui-serif", "serif"],
      },
    },
  },
  plugins: [],
};
