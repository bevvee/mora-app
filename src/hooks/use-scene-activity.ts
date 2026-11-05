import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";

export function useSceneActivity() {
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(
    AppState.currentState === "active",
  );
  // Keep the first render still until the system preference has been read.
  const [reducedMotion, setReducedMotion] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReducedMotion(value);
      })
      .catch(() => {});
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    const app = AppState.addEventListener("change", (state) =>
      setForeground(state === "active"),
    );
    return () => {
      mounted = false;
      motion.remove();
      app.remove();
    };
  }, []);
  return { active: focused && foreground, reducedMotion };
}
