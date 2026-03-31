/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Cabinet Grotesk'", "'DM Sans'", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#faf9f6",
          100: "#f5f4f0",
          200: "#eceae3",
          300: "#dedad0",
          400: "#c8c6bc",
          500: "#a8a59a",
        },
        ink: {
          900: "#1a1a1a",
          700: "#3d3d3d",
          500: "#6b6b6b",
          300: "#a0a0a0",
        },
        signal: "#1a56db",
        danger: "#dc2626",
        success: "#16a34a",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        lifted: "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
        button: "0 1px 2px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
