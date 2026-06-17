import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B2A4A", 700: "#103a63", 600: "#16487a", 50: "#eef3f9" },
        teal: { DEFAULT: "#1FA2BE", 600: "#178098", 400: "#3bb8d1", 50: "#e9f7fa" },
      },
      fontFamily: { sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"] },
      boxShadow: { card: "0 4px 20px -6px rgba(11,42,74,0.12)" },
    },
  },
  plugins: [],
};

export default config;
