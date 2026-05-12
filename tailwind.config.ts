import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design palette
        gold: {
          light: "#E2C78A",
          DEFAULT: "#C9A96E",
          dark: "#A8883D",
        },
        rose: {
          light: "#F08090",
          DEFAULT: "#E8637A",
          dark: "#C94060",
        },
        cream: {
          DEFAULT: "#F5EDE0",
          muted: "#D9C9B5",
        },
        dark: {
          base: "#0D0D0D",
          elevated: "#1A1A1A",
          high: "#222222",
          border: {
            subtle: "#2A2A2A",
            DEFAULT: "#333333",
            medium: "#444444",
            strong: "#555555",
          },
        },
      },
      boxShadow: {
        gold: "0 0 20px rgba(201, 169, 110, 0.15)",
        rose: "0 0 20px rgba(232, 99, 122, 0.2)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
