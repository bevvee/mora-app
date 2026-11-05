import Box from "lucide-react-native/icons/box";
import ImageIcon from "lucide-react-native/icons/image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "../../domain/store";
import { productPresentation } from "../../domain/product-presentation";
import { ProductStage } from "../three/product-stage";
import { colors, ProductImage, ui } from "./ui";

export function ProductGallery({ product }: { product: Product }) {
  const presentation = productPresentation(product);
  const [mode, setMode] = useState<"3d" | "photo">(
    presentation ? "3d" : "photo",
  );
  return (
    <View style={{ gap: 12 }}>
      {presentation && (
        <View accessibilityRole="tablist" style={styles.tabs}>
          {(
            [
              { value: "3d", label: "Explore in 3D", Icon: Box },
              { value: "photo", label: "Product photo", Icon: ImageIcon },
            ] as const
          ).map(({ value, label, Icon }) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === value }}
              onPress={() => setMode(value)}
              style={[styles.tab, mode === value && styles.selected]}
            >
              <Icon
                size={16}
                color={mode === value ? colors.ink : colors.muted}
                aria-hidden={true}
              />
              <Text
                style={[
                  styles.tabText,
                  mode === value && { color: colors.ink },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {mode === "3d" && presentation ? (
        <ProductStage product={product} />
      ) : (
        <ProductImage uri={product.image} label={product.name} large />
      )}
      {mode === "3d" && presentation && (
        <Text
          style={[
            ui.body,
            { fontSize: 12, lineHeight: 18, textAlign: "center" },
          ]}
        >
          Recreated from the MORA product photo. Rotate to explore the
          packaging.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.soft,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    padding: 8,
  },
  selected: { backgroundColor: colors.white },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    flexShrink: 1,
  },
});
