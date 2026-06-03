/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#f5f6f8",
        panel: "#ffffff",
        line: "#d9dde3",
        ink: "#111827",
        muted: "#6b7280",
      },
      fontFamily: {
        sans: ["'Segoe UI'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
