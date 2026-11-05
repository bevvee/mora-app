import { LegendList } from "@legendapp/list";
import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import Sparkles from "lucide-react-native/icons/sparkles";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppHeader, IconButton } from "../../components/shop/app-header";
import { Button, colors, Empty, ui } from "../../components/shop/ui";
import { cartDetails } from "../../domain/store";
import { productPresentation } from "../../domain/product-presentation";
import { useStore } from "../../state/store-provider";
import { ProductCard } from "../search/product-card";
import { GlowHero } from "./glow-hero";

export default function CatalogScreen() {
  const { store } = useStore();
  const [category, setCategory] = useState("All");
  const [heroVisible, setHeroVisible] = useState(true);
  const visible = useMemo(
    () => store.products.filter((product) => !product.hidden),
    [store.products],
  );
  const categories = [
    "All",
    ...new Set(visible.map((product) => product.category)),
  ];
  const selected = categories.includes(category) ? category : "All";
  const products = visible.filter(
    (product) => selected === "All" || selected === product.category,
  );
  const featured = visible.find((product) => !!productPresentation(product));
  const companion =
    visible.find(
      (product) =>
        product.id !== featured?.id &&
        productPresentation(product)?.kind === "cloud-cream",
    ) ??
    visible.find(
      (product) =>
        product.id !== featured?.id && !!productPresentation(product),
    );
  const cartCount = cartDetails(store).reduce(
    (sum, line) => sum + line.quantity,
    0,
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
      <LegendList
        style={{ flex: 1 }}
        data={products}
        numColumns={2}
        recycleItems
        estimatedItemSize={320}
        maintainVisibleContentPosition={false}
        keyExtractor={(product) => product.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={ui.content}
        columnWrapperStyle={{ gap: 14 }}
        onScroll={(event) =>
          setHeroVisible(event.nativeEvent.contentOffset.y < 700)
        }
        scrollEventThrottle={150}
        ListHeaderComponent={
          <View style={{ gap: 24, marginBottom: 20 }}>
            <GlowHero
              product={featured}
              companion={companion}
              visible={heroVisible}
              onExplore={() => router.push("/products")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map((item) => (
                <Button
                  key={item}
                  title={item}
                  secondary={selected !== item}
                  selected={selected === item}
                  onPress={() => setCategory(item)}
                />
              ))}
            </ScrollView>
            <View style={ui.row}>
              <View style={{ gap: 5 }}>
                <Text style={ui.eyebrow}>YOUR MORA COLLECTION</Text>
                <Text style={ui.heading}>Your new favorites</Text>
              </View>
              <Text
                accessibilityLiveRegion="polite"
                style={[ui.body, { fontSize: 12 }]}
              >
                {products.length}{" "}
                {products.length === 1 ? "essential" : "essentials"}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <Empty
            title="No essentials here yet"
            message="Try another category to find your next favorite."
          />
        }
        ListFooterComponent={
          <View
            style={[
              ui.card,
              {
                backgroundColor: colors.soft,
                alignItems: "center",
                padding: 28,
                marginTop: 8,
              },
            ]}
          >
            <Sparkles
              size={23}
              strokeWidth={1.3}
              color={colors.accent}
              aria-hidden={true}
            />
            <Text style={[ui.heading, { textAlign: "center" }]}>
              Beauty in the little things
            </Text>
            <Text style={[ui.body, { textAlign: "center" }]}>
              No rush. No rules. Just a little space for you.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
