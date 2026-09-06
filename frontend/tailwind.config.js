/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: "#0A0E1A", elevated: "#10162B", panel: "#151C33" },
        accent: { violet: "#7C5CFF", cyan: "#22D3EE" },
        text: { primary: "#F5F6FA", muted: "#8B93A8", faint: "#565F78" },
        status: {
          draft: "#6B7280",
          submitted: "#60A5FA",
          correction: "#FBBF24",
          approved: "#34D399",
          blocker: "#FB7185"
        },
        glass: { border: "rgba(255,255,255,0.10)", fill: "rgba(255,255,255,0.05)" }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"]
      },
      backdropBlur: { glass: "18px" },
      backgroundImage: { "accent-gradient": "linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%)" },
      borderRadius: { glass: "18px" }
    }
  },
  plugins: []
};
