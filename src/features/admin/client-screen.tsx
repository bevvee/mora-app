import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useStore } from "../../state/store-provider";
import { Empty, Screen, ui } from "../../components/shop/ui";
import { OrderList } from "../account/order-list";
export default function ClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store } = useStore();
  const customer = store.customers.find((item) => item.id === id);
  if (!customer)
    return (
      <Screen title="Customer unavailable" back>
        <Empty
          title="Customer not found"
          message="This profile is not available on this device."
        />
      </Screen>
    );
  return (
    <Screen title={customer.name} caption="CUSTOMER PROFILE" back>
      <View style={ui.card}>
        <Text style={ui.body}>
          {customer.email || "No email saved"}
          {"\n"}
          {customer.phone || "No phone saved"}
          {"\n"}
          {customer.address || "No address saved"}
          {"\n"}
          {customer.city}
        </Text>
      </View>
      <Text style={ui.heading}>Order history</Text>
      <OrderList
        orders={store.orders.filter(
          (order) => order.customerId === customer.id,
        )}
      />
    </Screen>
  );
}
