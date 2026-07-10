/** @type {import('tailwindcss').Config} */
module.exports = {
  important: "body",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-primeui")],
};
