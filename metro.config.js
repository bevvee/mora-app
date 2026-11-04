const { getDefaultConfig } = require("expo/metro-config");

// Shop screens use React Native StyleSheet; keep Metro's standard cross-platform resolver.
module.exports = getDefaultConfig(__dirname);
