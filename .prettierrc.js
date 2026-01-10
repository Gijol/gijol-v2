/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 120,

};

module.exports = config;