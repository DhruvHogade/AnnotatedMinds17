/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#F5E6CA",
        mahogany: "#4A0E17",
        sage: "#8F9779",
        ink: "#1A1A1A",
        softCream: "#FDFCF8",
        deepWood: "#5C4033",
        sienna: "#A0522D",
        paper: "#E8DFCA",
        // New Reference Colors
        sidebarBg: "#F6F3F0",
        contentBg: "#FAFAF8",
        accentTaupe: "#EAE1DD",
        textDark: "#3B3330",
        textGray: "#756A63",
        maroon: "#602B2B",
        progressGray: "#EBE7E2",
        primaryPill: "#E6EFE6",
        primaryPillText: "#537861"
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        garamond: ['"EB Garamond"', 'serif'],
        handwriting: ['"Indie Flower"', 'cursive'],
      }
    },
  },
  plugins: [],
}

