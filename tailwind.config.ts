import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B00",
          "orange-light": "#FF7A1A",
          "orange-dark": "#E56000",
        },
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          card: "var(--color-bg-card)",
          input: "var(--color-bg-input)",
          inverse: "var(--color-bg-inverse)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
        veg: "var(--color-veg)",
        "non-veg": "var(--color-non-veg)",
        egg: "var(--color-egg)",
        border: "var(--color-border)",
        "border-light": "var(--color-border-light)",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "bounce-cart": "bounceCart 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "heart-pop": "heartPop 0.4s cubic-bezier(0.17, 0.67, 0.35, 1.5)",
        "badge-pulse": "badgePulse 1.5s ease-in-out infinite",
        "float-up": "floatUp 0.5s ease-out",
        ripple: "ripple 0.6s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceCart: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        heartPop: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.4)" },
          "60%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        badgePulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.9" },
        },
        floatUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 8px rgba(255,107,0,0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(255,107,0,0.45)" },
        },
      },
      backdropBlur: {
        md: "12px",
      },
      maxWidth: {
        "8xl": "1440px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 40px rgba(255,107,0,0.12)",
        orange: "0 4px 20px rgba(255,107,0,0.3)",
        drawer: "−16px 0 48px rgba(0,0,0,0.12)",
        "glow-orange": "0 0 20px rgba(255,107,0,0.35)",
        soft: "0 2px 16px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
