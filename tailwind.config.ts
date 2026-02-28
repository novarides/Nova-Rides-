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
        nova: {
          black: "#0A0A0A",
          white: "#FAFAF8",
          grey: {
            100: "#F4F4F1",
            200: "#E8E8E4",
            400: "#ADADAA",
            600: "#6B6B68",
          },
          accent: "#E8A020",
          "accent-light": "#FFF4E0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        nova: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
