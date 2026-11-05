import Check from "lucide-react-native/icons/check";
import CreditCard from "lucide-react-native/icons/credit-card";
import Truck from "lucide-react-native/icons/truck";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../../state/store-provider";
import {
  cartDetails,
  cartTotal,
  makeId,
  money,
  type Payment,
} from "../../domain/store";
import {
  Button,
  Empty,
  errorMessage,
  Screen,
  ui,
} from "../../components/shop/ui";
import { CustomerFields } from "../account/customer-fields";
export default function CheckoutScreen() {
  const { store, commit } = useStore();
  const [shipping, setShipping] = useState(() => ({
    ...store.customers.find(
      (customer) => customer.id === store.activeCustomerId,
    )!,
  }));
  const [payment, setPayment] = useState<Payment>("cash");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [orderId] = useState(makeId);
  async function placeOrder() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await commit({
        type: "checkout",
        id: orderId,
        createdAt: new Date().toISOString(),
        shipping,
        payment,
      });
      router.replace({ pathname: "/orders/[id]", params: { id: orderId } });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <Screen title="Checkout" caption="A LITTLE CLOSER TO YOUR GLOW" back>
      {!store.cart.length ? (
        <>
          <Empty
            title="Your bag is empty"
            message="Add an essential before checking out."
          />
          <Button
            title="Browse essentials"
            onPress={() => router.replace("/home")}
          />
        </>
      ) : (
        <>
          <View style={ui.card}>
            <Text style={ui.heading}>Delivery details</Text>
            <CustomerFields value={shipping} onChange={setShipping} />
          </View>
          <View style={ui.card}>
            <Text style={ui.heading}>Payment</Text>
            <Text style={ui.body}>
              Local checkout demo. No money is charged. Do not enter real card
              details.
            </Text>
            <Button
              title="Cash on delivery"
              selected={payment === "cash"}
              icon={payment === "cash" ? Check : Truck}
              secondary={payment !== "cash"}
              disabled={busy}
              onPress={() => setPayment("cash")}
            />
            <Button
              title="Simulated card payment"
              selected={payment === "demo-card"}
              icon={payment === "demo-card" ? Check : CreditCard}
              secondary={payment !== "demo-card"}
              disabled={busy}
              onPress={() => setPayment("demo-card")}
            />
          </View>
          <View style={ui.card}>
            <Text style={ui.heading}>Your order</Text>
            {cartDetails(store).map(({ product, quantity }) => (
              <View key={product.id} style={ui.row}>
                <Text style={[ui.body, { flex: 1 }]}>
                  {quantity} × {product.name}
                </Text>
                <Text style={ui.bold}>
                  {money(product.price * quantity)}
                  {product.demoPrice ? " · demo" : ""}
                </Text>
              </View>
            ))}
            <Text style={ui.body}>Delivery: free for this local demo</Text>
            <Text style={ui.heading}>Total {money(cartTotal(store))}</Text>
            {!!error && (
              <Text accessibilityRole="alert" style={ui.error}>
                {error}
              </Text>
            )}
            <Button
              icon={Check}
              title={busy ? "Saving order…" : "Place demo order"}
              disabled={busy}
              onPress={() => {
                void placeOrder();
              }}
            />
          </View>
        </>
      )}
    </Screen>
  );
}
