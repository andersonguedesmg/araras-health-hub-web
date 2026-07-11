/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  important: "body",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-primeui")],
};
