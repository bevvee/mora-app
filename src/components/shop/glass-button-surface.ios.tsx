import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { colors } from "./theme";

const supportsGlass = isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

export function GlassButtonSurface({ disabled }: { disabled: boolean }) {
  // Show the opaque surface until the accessibility preference is known.
  const [reduceTransparency, setReduceTransparency] = useState(true);

  useEffect(() => {
    if (!supportsGlass) return;

    let active = true;
    let preferenceChanged = false;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      (enabled) => {
        preferenceChanged = true;
        setReduceTransparency(enabled);
      },
    );
    void AccessibilityInfo.isReduceTransparencyEnabled().then(
      (enabled) => {
        if (active && !preferenceChanged) setReduceTransparency(enabled);
      },
      () => {},
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (!supportsGlass || reduceTransparency) {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.surface,
          { backgroundColor: disabled ? colors.background : colors.soft },
        ]}
      />
    );
  }

  return (
    <GlassView
      pointerEvents="none"
      style={styles.surface}
      glassEffectStyle="regular"
      colorScheme="light"
      tintColor={`${colors.soft}33`}
      isInteractive={!disabled}
    />
  );
}

const styles = StyleSheet.create({
  surface: { ...StyleSheet.absoluteFill, borderRadius: 23 },
});
