// Metro resolves runtime.web.ts for the browser and this module on iOS/Android.
export { Canvas, useFrame } from "@react-three/fiber/native";
// The native entry point re-exports these same platform-neutral helpers.
// Import them directly so Metro does not pull in unrelated Drei features.
export { RoundedBox } from "@react-three/drei/core/RoundedBox";
export { useTexture } from "@react-three/drei/core/Texture";

export { Environment } from "@react-three/drei/core/Environment";
export { Lightformer } from "@react-three/drei/core/Lightformer";
