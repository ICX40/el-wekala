import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "#2563EB", // Royal Blue
          foreground: "#FFFFFF",
          hover: "#1D4ED8",
        },
        secondary: {
          DEFAULT: "#1E40AF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F97316", // Orange
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E", // Green
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#EAB308", // Yellow
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#EF4444", // Red
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8FAFC",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;