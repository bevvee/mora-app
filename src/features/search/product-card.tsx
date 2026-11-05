import { router } from "expo-router";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import Box from "lucide-react-native/icons/box";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, ProductImage, ui } from "../../components/shop/ui";
import { productPresentation } from "../../domain/product-presentation";
import { money, type Product } from "../../domain/store";

export function ProductCard({ product }: { product: Product }) {
  const hasModel = !!productPresentation(product);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${product.name}, ${product.demoPrice ? "demo price " : ""}${money(product.price)}${hasModel ? ", 3D preview available" : ""}`}
      onPress={() =>
        router.push({ pathname: "/product/[id]", params: { id: product.id } })
      }
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View>
        <ProductImage uri={product.image} label={product.name} />
        {hasModel && (
          <View style={styles.preview}>
            <Box size={11} color={colors.ink} aria-hidden={true} />
            <Text style={styles.previewText}>VIEW IN 3D</Text>
          </View>
        )}
      </View>
      <View style={styles.copy}>
        <Text style={[ui.eyebrow, { fontSize: 9, letterSpacing: 1.2 }]}>
          {product.category.toUpperCase()}
        </Text>
        <Text
          style={[ui.bold, { fontSize: 15, minHeight: 38 }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <View style={ui.row}>
          <Text
            style={[
              ui.body,
              { color: colors.accent, fontSize: 13, fontWeight: "600" },
            ]}
          >
            {money(product.price)}
          </Text>
          <ArrowUpRight size={16} color={colors.accent} aria-hidden={true} />
        </View>
        {product.demoPrice && (
          <Text style={[ui.eyebrow, { fontSize: 9, letterSpacing: 1 }]}>
            DEMO PRICE
          </Text>
        )}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  copy: { padding: 12, gap: 8 },
  preview: {
    position: "absolute",
    left: 9,
    bottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    backgroundColor: "#FCFAF7ED",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  previewText: {
    fontSize: 8,
    letterSpacing: 0.8,
    color: colors.ink,
    fontWeight: "700",
  },
});
