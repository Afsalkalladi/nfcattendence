import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      colors: {
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        subtle: "rgb(var(--c-subtle) / <alpha-value>)",
        brand: "rgb(var(--c-brand) / <alpha-value>)",
        "brand-hover": "rgb(var(--c-brand-hover) / <alpha-value>)",
        "brand-soft": "rgb(var(--c-brand-soft) / <alpha-value>)",
        ok: "rgb(var(--c-ok) / <alpha-value>)",
        "ok-soft": "rgb(var(--c-ok-soft) / <alpha-value>)",
        warn: "rgb(var(--c-warn) / <alpha-value>)",
        "warn-soft": "rgb(var(--c-warn-soft) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
        "danger-hover": "rgb(var(--c-danger-hover) / <alpha-value>)",
        "danger-soft": "rgb(var(--c-danger-soft) / <alpha-value>)",
        info: "rgb(var(--c-info) / <alpha-value>)",
        "info-soft": "rgb(var(--c-info-soft) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "none" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.97)" },
          to: { opacity: "1", transform: "none" },
        },
        breathe: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".45" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in .3s ease-out both",
        "scale-in": "scale-in .18s ease-out both",
        breathe: "breathe 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
