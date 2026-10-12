/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#030306",
          surface: "#09090f",
          card: "#0d0d15",
          border: "rgba(255, 255, 255, 0.08)",
          cyan: "#00F2FE",
          blue: "#4FACFE",
          purple: "#9D4EDD",
          pink: "#F72585",
          emerald: "#10B981",
          orange: "#FF7247",
        }
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'IBM Plex Mono'", "monospace"],
        display: ["'Martian Mono'", "'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "-apple-system", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
