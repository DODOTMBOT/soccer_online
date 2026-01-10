import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Colors (Смысловые)
        background: "var(--background)", // #F8FAFC (Светло-серый)
        surface: "var(--surface)",       // #FFFFFF
        border: "var(--border)",         // #E2E8F0
        
        // Brand Colors
        primary: {
          DEFAULT: "#0F172A", // Твой Navy, но строже
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#059669", // Emerald для футбольных акцентов
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#DC2626", // Red
        },
        
        // Text Colors
        main: "#0F172A",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "8px",
        xl: "12px",
      }
    },
  },
  plugins: [],
};
export default config;