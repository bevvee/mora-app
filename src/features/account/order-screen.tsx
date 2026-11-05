import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useStore } from "../../state/store-provider";
import { money } from "../../domain/store";
import { Empty, Screen, ui } from "../../components/shop/ui";
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store, admin } = useStore();
  const order = store.orders.find(
    (item) =>
      item.id === id && (admin || item.customerId === store.activeCustomerId),
  );
  if (!order)
    return (
      <Screen title="Order unavailable" back>
        <Empty
          title="Order not found"
          message="This order is not available for your active profile."
        />
      </Screen>
    );
  return (
    <Screen title="Order details" caption="SAVED ON THIS DEVICE" back>
      <View style={ui.card}>
        <Text style={ui.heading}>Thank you, {order.shipping.name}</Text>
        <Text style={ui.body}>
          Your local demo order is saved. No real payment was collected.
        </Text>
        <Text selectable style={ui.eyebrow}>
          {order.id.toUpperCase()}
        </Text>
        <Text style={ui.body}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>
        <Text style={ui.bold}>{order.status}</Text>
      </View>
      <View style={ui.card}>
        {order.items.map((item) => (
          <View key={item.productId} style={ui.row}>
            <View style={{ flex: 1 }}>
              <Text style={ui.bold}>{item.name}</Text>
              <Text style={ui.body}>
                {item.quantity} × {money(item.price)}
              </Text>
            </View>
            <Text style={ui.bold}>{money(item.quantity * item.price)}</Text>
          </View>
        ))}
        <Text style={ui.body}>Delivery: free</Text>
        <Text style={ui.heading}>Total {money(order.total)}</Text>
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Delivery to</Text>
        <Text style={ui.body}>
          {order.shipping.name}
          {"\n"}
          {order.shipping.address}
          {"\n"}
          {order.shipping.city}
          {"\n"}
          {order.shipping.phone}
          {"\n"}
          {order.shipping.email}
        </Text>
        <Text style={ui.body}>
          Payment:{" "}
          {order.payment === "cash"
            ? "Cash on delivery (demo)"
            : "Simulated card"}
        </Text>
      </View>
    </Screen>
  );
}
