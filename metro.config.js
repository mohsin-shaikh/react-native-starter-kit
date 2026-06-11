const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Uniwind processes the Tailwind v4 CSS entry at build time and generates the
// className type declarations into `dtsFile`.
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
});
