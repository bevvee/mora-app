import { LegendList } from "@legendapp/list";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/shop/app-header";
import { Button, Empty, ui } from "../../components/shop/ui";
import { categoryProducts } from "../../domain/catalog";
import { useStore } from "../../state/store-provider";
import { ProductCard } from "./product-card";

export default function ProductsScreen() {
  const params = useLocalSearchParams<{
    category?: string | string[];
    subcategory?: string | string[];
  }>();
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const subcategory =
    typeof params.subcategory === "string" ? params.subcategory : undefined;
  const invalidParams =
    Array.isArray(params.category) || Array.isArray(params.subcategory);
  const { store } = useStore();
  const products = invalidParams
    ? []
    : categoryProducts(store.products, category, subcategory);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={ui.fill}>
      <AppHeader
        title={subcategory || category || "All products"}
        caption={
          subcategory && category
            ? category.toUpperCase()
            : "YOUR BEAUTY ESSENTIALS"
        }
        back
      />
      <LegendList
        style={{ flex: 1 }}
        recycleItems
        estimatedItemSize={320}
        maintainVisibleContentPosition={false}
        data={products}
        numColumns={2}
        keyExtractor={(product) => product.id}
        contentContainerStyle={ui.content}
        columnWrapperStyle={{ gap: 14 }}
        ListHeaderComponent={
          <Text style={ui.body}>
            {products.length} {products.length === 1 ? "product" : "products"}
          </Text>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <View style={{ gap: 20 }}>
            <Empty
              title="No products here yet"
              message="Explore another subcategory to find your next favorite."
            />
            <Button
              title="Browse categories"
              secondary
              onPress={() => router.replace("/search")}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
