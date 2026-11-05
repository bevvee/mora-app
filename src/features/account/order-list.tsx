import ChevronRight from "lucide-react-native/icons/chevron-right";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { money, type Order } from "../../domain/store";
import { Button, Empty, ui } from "../../components/shop/ui";
export function OrderList({ orders }: { orders: Order[] }) {
  if (!orders.length)
    return (
      <Empty
        title="No orders yet"
        message="Completed local checkouts will appear here."
      />
    );
  return (
    <View style={{ gap: 14 }}>
      {orders.map((order) => (
        <View key={order.id} style={ui.card}>
          <Text style={ui.eyebrow}>ORDER {order.id.toUpperCase()}</Text>
          <Text style={ui.body}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
          <Text style={ui.bold}>
            {money(order.total)} ·{" "}
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
          </Text>
          <Text style={ui.body}>{order.status}</Text>
          <Button
            icon={ChevronRight}
            title="View order"
            secondary
            onPress={() =>
              router.push({
                pathname: "/orders/[id]",
                params: { id: order.id },
              })
            }
          />
        </View>
      ))}
    </View>
  );
}
