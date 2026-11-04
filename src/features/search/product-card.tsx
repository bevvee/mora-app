import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { ProductImage, ui } from "../../components/shop/ui";
import { money, type Product } from "../../domain/store";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${product.name}, ${money(product.price)}`}
      onPress={() =>
        router.push({ pathname: "/product/[id]", params: { id: product.id } })
      }
      style={({ pressed }) => ({
        flex: 1,
        maxWidth: "48%",
        gap: 8,
        marginBottom: 4,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <ProductImage key={product.image} uri={product.image} />
      <Text style={ui.eyebrow}>{product.category.toUpperCase()}</Text>
      <Text style={ui.bold}>{product.name}</Text>
      <Text style={ui.body}>{money(product.price)}</Text>
    </Pressable>
  );
}
