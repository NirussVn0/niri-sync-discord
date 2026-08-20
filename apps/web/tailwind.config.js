/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: "#111726",
        "surface-hover": "#172033",
        "surface-border": "#1e293b",
        primary: "#38bdf8",
        accent: "#6366f1",
      },
    },
  },
  plugins: [],
};
