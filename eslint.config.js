// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*"] },
  {
    files: [
      "src/components/three/product-model.tsx",
      "src/components/three/product-scene.tsx",
      "src/components/three/reference-label.tsx",
    ],
    // These files use Three.js scene properties, rather than DOM attributes.
    rules: { "react/no-unknown-property": "off" },
  },
]);
