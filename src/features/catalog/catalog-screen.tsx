import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import { AppHeader, IconButton } from "../../components/shop/app-header";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStore } from "../../state/store-provider";
import { cartDetails, money } from "../../domain/store";
import { Button, Empty, ProductImage, ui } from "../../components/shop/ui";

export default function CatalogScreen() {
  const { store } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const visible = useMemo(
    () => store.products.filter((product) => !product.hidden),
    [store.products],
  );
  const categories = [
    "All",
    ...new Set(visible.map((product) => product.category)),
  ];
  const cartCount = cartDetails(store).reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  const products = visible.filter(
    (product) =>
      (category === "All" || category === product.category) &&
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={ui.fill}>
      <AppHeader
        title="mora."
        caption="YOUR EVERYDAY GLOW"
        brand
        actions={
          <IconButton
            icon={ShoppingBag}
            label={`Open bag, ${cartCount} items`}
            badge={cartCount}
            onPress={() => router.push("/cart")}
          />
        }
      />
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(product) => product.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={ui.content}
        columnWrapperStyle={{ gap: 16 }}
        ListHeaderComponent={
          <View style={{ gap: 24, marginBottom: 8 }}>
            <View
              style={[
                ui.card,
                { backgroundColor: "#EDE0D2", paddingVertical: 32 },
              ]}
            >
              <Text style={ui.eyebrow}>THE GLOW EDIT</Text>
              <Text style={[ui.title, { fontSize: 36 }]}>
                A little care.{"\n"}A lot of glow.
              </Text>
              <Text style={ui.body}>
                Beauty essentials for your everyday ritual.
              </Text>
              <Button
                icon={ArrowUpRight}
                title="Explore skincare"
                onPress={() => {
                  setSearch("");
                  setCategory("Skincare");
                }}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map((item) => (
                <Button
                  key={item}
                  title={item}
                  secondary={category !== item}
                  onPress={() => setCategory(item)}
                />
              ))}
            </ScrollView>
            <View style={ui.row}>
              <Text style={ui.heading}>Your new favorites</Text>
              <Text style={ui.body}>{products.length} essentials</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}`}
            onPress={() =>
              router.push({
                pathname: "/product/[id]",
                params: { id: item.id },
              })
            }
            style={{ flex: 1, maxWidth: "48%", gap: 8, marginBottom: 20 }}
          >
            <ProductImage key={item.image} uri={item.image} />
            <Text style={ui.eyebrow}>{item.category.toUpperCase()}</Text>
            <Text style={ui.bold}>{item.name}</Text>
            <Text style={ui.body}>{money(item.price)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Empty
            title="No essentials found"
            message="Try another search or category."
          />
        }
        ListFooterComponent={
          <View style={ui.card}>
            <Text style={ui.heading}>Beauty in the little things</Text>
            <Text style={ui.body}>
              Make a little space for yourself, every day.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
