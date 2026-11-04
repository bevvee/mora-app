import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import Plus from "lucide-react-native/icons/plus";
import { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "../../state/store-provider";
import { money } from "../../domain/store";
import {
  Button,
  Empty,
  errorMessage,
  ProductImage,
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
    <Screen title={product.name} caption={product.category.toUpperCase()} back>
      <ProductImage key={product.image} uri={product.image} large />
      <View style={ui.row}>
        <Text style={ui.heading}>{money(product.price)}</Text>
        <Text style={ui.body}>Your everyday ritual</Text>
      </View>
      <Text style={ui.body}>{product.description}</Text>
      <Button
        icon={Plus}
        title={busy ? "Adding…" : "Add to bag"}
        disabled={busy}
        onPress={() => {
          void add();
        }}
      />
      <Text accessibilityLiveRegion="polite" style={ui.body}>
        {message}
      </Text>
      <Button
        icon={ShoppingBag}
        title="View bag"
        secondary
        onPress={() => router.push("/cart")}
      />
    </Screen>
  );
}
