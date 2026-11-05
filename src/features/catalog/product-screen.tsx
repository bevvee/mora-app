import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import Plus from "lucide-react-native/icons/plus";
import { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "../../state/store-provider";
import { money } from "../../domain/store";
import { productPresentation } from "../../domain/product-presentation";
import { ProductGallery } from "../../components/shop/product-gallery";
import { IconButton } from "../../components/shop/app-header";
import {
  Button,
  Empty,
  errorMessage,
  Screen,
  ui,
} from "../../components/shop/ui";
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store, commit } = useStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const product = store.products.find((item) => item.id === id && !item.hidden);
  if (!product)
    return (
      <Screen title="Product unavailable" back>
        <Empty
          title="This essential is unavailable"
          message="It may have been hidden or removed from the shop."
        />
        <Button
          title="Browse the shop"
          onPress={() => router.replace("/home")}
        />
      </Screen>
    );
  async function add() {
    if (!product || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await commit({ type: "cart", productId: product.id, amount: 1 });
      setMessage("Added to your bag.");
    } catch (cause) {
      setMessage(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title={product.name}
      caption={product.category.toUpperCase()}
      back
      footer={
        <View style={{ gap: 8 }}>
          {product.demoPrice && (
            <Text style={[ui.eyebrow, { fontSize: 10 }]}>
              DEMO PRICE · PREVIEW ONLY
            </Text>
          )}
          {!!message && (
            <Text
              accessibilityLiveRegion="polite"
              style={[ui.body, { fontSize: 13 }]}
            >
              {message}
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                icon={Plus}
                title={
                  busy ? "Adding…" : `Add to bag · ${money(product.price)}`
                }
                disabled={busy}
                onPress={() => {
                  void add();
                }}
              />
            </View>
            <IconButton
              icon={ShoppingBag}
              label="View bag"
              onPress={() => router.push("/cart")}
            />
          </View>
        </View>
      }
    >
      <ProductGallery key={product.id} product={product} />
      {productPresentation(product) && (
        <Text style={[ui.heading, { fontSize: 24 }]}>
          {productPresentation(product)?.note}
        </Text>
      )}
      <View style={ui.row}>
        <Text style={ui.heading}>{money(product.price)}</Text>
        <Text style={ui.body}>
          {productPresentation(product)?.volume ?? "Your everyday ritual"}
        </Text>
      </View>
      <Text style={ui.body}>{product.description}</Text>
    </Screen>
  );
}
