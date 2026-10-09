/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Theme-reactive tokens — driven by CSS variables that flip in
        // html.light (see index.css). Every component that uses these
        // automatically re-themes; nothing per-component to maintain.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        overlay: "rgb(var(--color-overlay) / <alpha-value>)",

        // Fixed brand accents — identical in both themes by design.
        violet: "#6C63FF",
        purple: "#7F5AF0",
        sky: "#3ABEFF",
        cyan: "#00D4FF",

        // Text/icon color for anything sitting on a bright accent surface
        // (logo badges, avatar initials) — always dark, never theme-reactive,
        // since the accent gradient itself doesn't change with theme.
        onaccent: "#0a0a12",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 1 },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
