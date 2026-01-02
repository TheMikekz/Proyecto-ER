/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          300: "#b7c195",
          500: "#7e8c54",
          600: "#636f41",
          700: "#4d5635",
          900: "#373d2a",
        },
      },
    },
  },
  plugins: [],
};
