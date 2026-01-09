const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

// Inline flattenColorPalette to avoid version compatibility issues
function flattenColorPalette(colors) {
  return Object.assign(
    {},
    ...Object.entries(colors !== null && colors !== void 0 ? colors : {}).flatMap(
      ([color, values]) =>
        typeof values === "object"
          ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
              [color + (number === "DEFAULT" ? "" : `-${number}`)]: hex,
            }))
          : [{ [`${color}`]: values }]
    )
  );
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
