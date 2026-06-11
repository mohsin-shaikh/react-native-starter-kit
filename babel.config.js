module.exports = function (api) {
  api.cache(true);
  return {
    // Uniwind needs no Babel preset (className is handled by the Metro
    // transform), so this is just the stock Expo preset.
    presets: ["babel-preset-expo"],
    plugins: [
      // Reanimated 4's worklets plugin must be listed LAST.
      "react-native-worklets/plugin",
    ],
  };
};
