import Save from "lucide-react-native/icons/save";
import Trash2 from "lucide-react-native/icons/trash";
import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "../../state/store-provider";
import { getSubcategories, productSubcategory } from "../../domain/catalog";
import { makeId, type Product } from "../../domain/store";
import {
  Button,
  Empty,
  errorMessage,
  Field,
  Screen,
  ui,
} from "../../components/shop/ui";
function Editor({
  product,
  creating,
}: {
  product: Product;
  creating: boolean;
}) {
  const { store, commit } = useStore();
  const [draft, setDraft] = useState(() => ({
    ...product,
    subcategory:
      productSubcategory(product) === "Other"
        ? ""
        : productSubcategory(product),
  }));
  const [price, setPrice] = useState(creating ? "" : product.price.toString());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function save() {
    setBusy(true);
    setError("");
    try {
      await commit({
        type: "save-product",
        product: {
          ...draft,
          name: draft.name.trim(),
          category: draft.category.trim(),
          subcategory: draft.subcategory.trim() || undefined,
          description: draft.description.trim(),
          image: draft.image.trim(),
          price: Number(price.replace(",", ".")),
        },
      });
      router.replace("/admin/products");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await commit({ type: "delete-product", id: product.id });
      router.replace("/admin/products");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title={creating ? "Add an essential" : "Edit product"}
      caption="LOCAL ADMIN"
      back
    >
      <Field
        label="Product name"
        value={draft.name}
        onChangeText={(name) => setDraft({ ...draft, name })}
      />
      <Field
        label="Category"
        placeholder="Skincare, Makeup, Fragrance…"
        value={draft.category}
        onChangeText={(category) =>
          setDraft({ ...draft, category, subcategory: "" })
        }
      />
      <Field
        label="Subcategory"
        placeholder="Serums, Lips, Eau de parfum..."
        value={draft.subcategory}
        onChangeText={(subcategory) => setDraft({ ...draft, subcategory })}
      />
      <View style={ui.row}>
        {getSubcategories(draft.category, store.products).map((subcategory) => (
          <Button
            key={subcategory}
            title={subcategory}
            secondary={draft.subcategory !== subcategory}
            selected={draft.subcategory === subcategory}
            onPress={() => setDraft({ ...draft, subcategory })}
          />
        ))}
      </View>
      <Field
        label="Price (MAD)"
        value={price}
        keyboardType="decimal-pad"
        onChangeText={setPrice}
      />
      <View style={ui.row}>
        <Text style={ui.bold}>Demo price · preview only</Text>
        <Switch
          accessibilityLabel="Mark product price as a demo"
          value={draft.demoPrice === true}
          onValueChange={(demoPrice) => setDraft({ ...draft, demoPrice })}
          disabled={busy}
        />
      </View>
      <Field
        label="Description"
        multiline
        value={draft.description}
        onChangeText={(description) => setDraft({ ...draft, description })}
      />
      <Field
        label="Image URL"
        autoCapitalize="none"
        keyboardType="url"
        value={draft.image}
        onChangeText={(image) => setDraft({ ...draft, image })}
      />
      <View style={ui.row}>
        <Text style={ui.bold}>Hide from customers</Text>
        <Switch
          accessibilityLabel="Hide product from shop"
          value={draft.hidden}
          disabled={busy}
          onValueChange={(hidden) => setDraft({ ...draft, hidden })}
        />
      </View>
      <Text style={ui.body}>
        Hiding or deleting a product removes it from local bags. Past orders
        keep their original details.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      <Button
        icon={Save}
        title={busy ? "Saving…" : "Save product"}
        disabled={busy}
        onPress={() => {
          void save();
        }}
      />
      {!creating &&
        (deleting ? (
          <View style={ui.card}>
            <Text style={ui.error}>
              Delete {product.name}? This removes it from the catalog and bag.
              Order history is preserved.
            </Text>
            <Button
              icon={Trash2}
              title="Confirm delete"
              disabled={busy}
              onPress={() => {
                void remove();
              }}
            />
            <Button
              title="Keep product"
              secondary
              disabled={busy}
              onPress={() => setDeleting(false)}
            />
          </View>
        ) : (
          <Button
            icon={Trash2}
            title="Delete product"
            secondary
            disabled={busy}
            onPress={() => setDeleting(true)}
          />
        ))}
    </Screen>
  );
}
export default function ProductEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store } = useStore();
  const [newProduct] = useState<Product>(() => ({
    id: makeId(),
    name: "",
    category: "Skincare",
    description: "",
    price: 0,
    image: "",
    hidden: false,
  }));
  const product =
    id === "new" ? newProduct : store.products.find((item) => item.id === id);
  if (!product)
    return (
      <Screen title="Product unavailable" back>
        <Empty
          title="Product not found"
          message="It may have already been deleted."
        />
      </Screen>
    );
  return <Editor key={product.id} product={product} creating={id === "new"} />;
}
