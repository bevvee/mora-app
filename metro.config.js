const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const nativeThreePath = require.resolve("three");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fiber's native entry patches the CommonJS Three.js texture loader. Resolve
  // ES imports to that same instance so Drei can load labels without a DOM.
  if (moduleName === "three" && (platform === "ios" || platform === "android")) {
    return { type: "sourceFile", filePath: nativeThreePath };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
