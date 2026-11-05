import ArrowRight from "lucide-react-native/icons/arrow-right";
import Minus from "lucide-react-native/icons/minus";
import Plus from "lucide-react-native/icons/plus";
import Trash2 from "lucide-react-native/icons/trash";
import { IconButton } from "../../components/shop/app-header";
import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../../state/store-provider";
import { cartDetails, cartTotal, money } from "../../domain/store";
import {
  Button,
  Empty,
  errorMessage,
  Screen,
  ui,
} from "../../components/shop/ui";
export default function CartScreen() {
  const { store, commit } = useStore();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lines = cartDetails(store);
  async function change(productId: string, amount: number) {
    setBusy(true);
    setError("");
    try {
      await commit({ type: "cart", productId, amount });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen title="My beauty bag" caption="PICKED FOR YOUR RITUAL">
      {!lines.length ? (
        <>
          <Empty
            title="Your bag is waiting"
            message="Find something lovely for your daily routine."
          />
          <Button title="Explore Mora" onPress={() => router.push("/home")} />
        </>
      ) : (
        <>
          {lines.map(({ product, quantity }) => (
            <View key={product.id} style={ui.card}>
              <Text style={ui.eyebrow}>{product.category}</Text>
              <Button
                title={product.name}
                secondary
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: product.id },
                  })
                }
              />
              <Text style={ui.body}>
                {money(product.price)} each
                {product.demoPrice ? " · demo price" : ""}
              </Text>
              <View style={ui.row}>
                <IconButton
                  icon={Minus}
                  label={`Remove one ${product.name}`}
                  disabled={busy}
                  onPress={() => {
                    void change(product.id, -1);
                  }}
                />
                <Text style={ui.bold}>{quantity}</Text>
                <IconButton
                  icon={Plus}
                  label={`Add one ${product.name}`}
                  disabled={busy || quantity >= 99}
                  onPress={() => {
                    void change(product.id, 1);
                  }}
                />
              </View>
              <View style={ui.row}>
                <Button
                  icon={Trash2}
                  title="Remove"
                  secondary
                  disabled={busy}
                  onPress={() => {
                    void change(product.id, -quantity);
                  }}
                />
                <Text style={ui.bold}>{money(product.price * quantity)}</Text>
              </View>
            </View>
          ))}
          <View style={ui.card}>
            <View style={ui.row}>
              <Text style={ui.body}>Subtotal</Text>
              <Text style={ui.bold}>{money(cartTotal(store))}</Text>
            </View>
            <View style={ui.row}>
              <Text style={ui.body}>Delivery</Text>
              <Text style={ui.body}>Free · local demo</Text>
            </View>
            <Button
              icon={ArrowRight}
              title="Continue to checkout"
              disabled={busy}
              onPress={() => router.push("/checkout")}
            />
          </View>
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
    </Screen>
  );
}
