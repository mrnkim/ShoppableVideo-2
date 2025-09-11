/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        milling: ["Milling", "sans-serif"],
        'ibm-plex-mono': ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      colors: {
        primary: "#9AED59",
        secondary: "#444444",
        accent: "#0070f3",
        "white-200": "#f9f9f9",
        "zinc-100": "#f4f3f3",
        "gray-200": "#E2E2E2",
        "gray-300": "#D3D1CF",
        "gray-500": "#bdbcbb",
        "gray-600": "#45423F",
        blue: "#C4EEFE",
        "light-purple": "#FBDFFF",
        "light-pink": "#FFDFEB",
        red: "#e22e22",
        generate: "#FDE3AE",
        green: "#5FD269",
        "confidence-high": "#30710e",
        "confidence-medium": "#846617",
        "global-text": "#1D1C1B"
      },
      animation: {
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fadeIn": "fadeIn 0.1s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, 10px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
    },
  },
  plugins: [],
};
