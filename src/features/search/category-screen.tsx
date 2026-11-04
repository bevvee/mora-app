import { router, useLocalSearchParams } from "expo-router";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/shop/app-header";
import { Button, colors, Empty, ui } from "../../components/shop/ui";
import {
  categoryProducts,
  getCategories,
  getSubcategories,
  productSubcategory,
} from "../../domain/catalog";
import { useStore } from "../../state/store-provider";

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const category = typeof params.category === "string" ? params.category : "";
  const { store } = useStore();
  const definition = getCategories(store.products).find(
    (item) => item.name === category,
  );
  const products = categoryProducts(store.products, category);
  const subcategories = definition ? getSubcategories(category, products) : [];

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={ui.fill}>
      <AppHeader
        title={definition?.name ?? "Category unavailable"}
        caption="EXPLORE YOUR RITUAL"
        back
      />
      <FlatList
        data={subcategories}
        keyExtractor={(subcategory) => subcategory}
        contentContainerStyle={ui.content}
        ListHeaderComponent={
          definition ? (
            <View style={{ gap: 20 }}>
              <Text style={ui.body}>{definition.description}</Text>
              <Button
                title={`All ${category}`}
                icon={ArrowUpRight}
                onPress={() =>
                  router.push({ pathname: "/products", params: { category } })
                }
              />
              <Text style={ui.heading}>Shop by subcategory</Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const count = products.filter(
            (product) => productSubcategory(product) === item,
          ).length;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Browse ${item}, ${count} ${count === 1 ? "product" : "products"}`}
              onPress={() =>
                router.push({
                  pathname: "/products",
                  params: { category, subcategory: item },
                })
              }
              style={({ pressed }) => [ui.card, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={[ui.row, { flexWrap: "nowrap" }]}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={ui.bold}>{item}</Text>
                  <Text style={ui.body}>
                    {count} {count === 1 ? "product" : "products"}
                  </Text>
                </View>
                <ChevronRight
                  size={22}
                  color={colors.muted}
                  accessible={false}
                />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={{ gap: 20 }}>
            <Empty
              title="Category unavailable"
              message="Browse the categories to find your next essential."
            />
            <Button
              title="Browse categories"
              onPress={() => router.replace("/search")}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
