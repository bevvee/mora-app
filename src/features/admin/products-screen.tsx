import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import Pencil from "lucide-react-native/icons/pencil";
import Plus from "lucide-react-native/icons/plus";
import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../../state/store-provider";
import { money, type Product } from "../../domain/store";
import {
  Button,
  Empty,
  errorMessage,
  Field,
  Screen,
  ui,
} from "../../components/shop/ui";
export default function ProductsScreen() {
  const { store, commit } = useStore();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function toggle(product: Product) {
    setBusy(true);
    setError("");
    try {
      await commit({
        type: "save-product",
        product: { ...product, hidden: !product.hidden },
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  const products = store.products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <Screen title="Products" caption="LOCAL ADMIN" back>
      <Button
        icon={Plus}
        title="Add product"
        onPress={() =>
          router.push({
            pathname: "/admin/products/[id]",
            params: { id: "new" },
          })
        }
      />
      <Field label="Search products" value={search} onChangeText={setSearch} />
      {!!error && <Text style={ui.error}>{error}</Text>}
      {products.length === 0 && (
        <Empty
          title="No products"
          message="Add an essential or try another search."
        />
      )}
      {products.map((product) => (
        <View key={product.id} style={ui.card}>
          <Text style={ui.heading}>{product.name}</Text>
          <Text style={ui.body}>
            {product.category} · {money(product.price)}
            {product.demoPrice ? " · demo price" : ""}
          </Text>
          <Text style={ui.bold}>
            {product.hidden ? "Hidden from shop" : "Visible in shop"}
          </Text>
          <Button
            icon={Pencil}
            title="Edit or delete"
            secondary
            onPress={() =>
              router.push({
                pathname: "/admin/products/[id]",
                params: { id: product.id },
              })
            }
          />
          <Button
            icon={product.hidden ? Eye : EyeOff}
            title={product.hidden ? "Show product" : "Hide product"}
            secondary
            disabled={busy}
            onPress={() => {
              void toggle(product);
            }}
          />
        </View>
      ))}
    </Screen>
  );
}
