import { StyleSheet, View } from "react-native";
import { colors } from "./theme";

export function GlassButtonSurface({ disabled }: { disabled: boolean }) {
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

const styles = StyleSheet.create({
  surface: {
    ...StyleSheet.absoluteFill,
    borderRadius: 23,
  },
});
