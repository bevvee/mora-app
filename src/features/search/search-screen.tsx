import { LegendList } from "@legendapp/list";
import { router } from "expo-router";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Droplets from "lucide-react-native/icons/droplets";
import Flower2 from "lucide-react-native/icons/flower-2";
import Palette from "lucide-react-native/icons/palette";
import Sparkles from "lucide-react-native/icons/sparkles";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/shop/app-header";
import { Button, colors, Empty, Field, ui } from "../../components/shop/ui";
import { getCategories, searchProducts } from "../../domain/catalog";
import { useStore } from "../../state/store-provider";
import { ProductCard } from "./product-card";

export default function SearchScreen() {
  const { store } = useStore();
  const [query, setQuery] = useState("");
  const categories = useMemo(
    () => getCategories(store.products),
    [store.products],
  );
  const results = useMemo(
    () => searchProducts(store.products, query),
    [store.products, query],
  );
  const searching = !!query.trim();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={ui.fill}>
      <AppHeader title="Search" caption="FIND YOUR EVERYDAY ESSENTIALS" />
      <KeyboardAvoidingView
        style={ui.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[ui.content, { paddingBottom: 0, gap: 12 }]}>
          <Field
            label="Search by product name"
            placeholder="Try serum, lipstick, or parfum"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searching && (
            <View style={ui.row}>
              <Text accessibilityLiveRegion="polite" style={ui.body}>
                {results.length} {results.length === 1 ? "product" : "products"}{" "}
                found
              </Text>
              <Button
                title="Clear search"
                secondary
                onPress={() => setQuery("")}
              />
            </View>
          )}
        </View>
        {searching ? (
          <LegendList
            style={{ flex: 1 }}
            key="search-results"
            recycleItems
            estimatedItemSize={320}
            maintainVisibleContentPosition={false}
            data={results}
            numColumns={2}
            keyExtractor={(product) => product.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={ui.content}
            columnWrapperStyle={{ gap: 14 }}
            renderItem={({ item }) => <ProductCard product={item} />}
            ListEmptyComponent={
              <Empty
                title="No products found"
                message="Try another product name, or clear your search to browse categories."
              />
            }
          />
        ) : (
          <LegendList
            style={{ flex: 1 }}
            key="categories"
            recycleItems
            estimatedItemSize={160}
            data={categories}
            keyExtractor={(category) => category.name}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={ui.content}
            ListHeaderComponent={
              <View style={{ gap: 7 }}>
                <Text style={ui.heading}>Browse categories</Text>
                <Text style={ui.body}>
                  Explore beauty, one ritual at a time.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const Icon =
                item.name === "Skincare"
                  ? Droplets
                  : item.name === "Makeup"
                    ? Palette
                    : item.name === "Fragrance"
                      ? Flower2
                      : Sparkles;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${item.name}`}
                  onPress={() =>
                    router.push({
                      pathname: "/categories/[category]",
                      params: { category: item.name },
                    })
                  }
                  style={({ pressed }) => [
                    ui.card,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={ui.row}>
                    <Icon
                      size={30}
                      strokeWidth={1.5}
                      color={colors.accent}
                      aria-hidden={true}
                    />
                    <ChevronRight
                      size={21}
                      color={colors.muted}
                      aria-hidden={true}
                    />
                  </View>
                  <Text style={ui.heading}>{item.name}</Text>
                  <Text style={ui.body}>{item.description}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
