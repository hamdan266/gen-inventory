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
        brutal: {
          yellow: "#FFE600",
          pink: "#FF3B80",
          blue: "#0082F3",
          green: "#00C853",
          orange: "#FF6D00",
          purple: "#7C4DFF",
          red: "#FF1744",
          dark: "#1A1A1A",
          cream: "#FFFBF0",
          gray: "#D0D0D0",
        },
      },
      boxShadow: {
        brutal: "6px 6px 0px 0px #000000",
        "brutal-lg": "10px 10px 0px 0px #000000",
        "brutal-sm": "3px 3px 0px 0px #000000",
      },
      borderWidth: {
        brutal: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
