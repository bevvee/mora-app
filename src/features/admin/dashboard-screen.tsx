import LogOut from "lucide-react-native/icons/log-out";
import Package from "lucide-react-native/icons/package";
import Users from "lucide-react-native/icons/users";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../../state/store-provider";
import { money } from "../../domain/store";
import { Button, Screen, ui } from "../../components/shop/ui";
import { OrderList } from "../account/order-list";
export default function DashboardScreen() {
  const { store, setAdmin } = useStore();
  return (
    <Screen title="Store dashboard" caption="MORA · LOCAL ADMIN" back>
      <View style={ui.card}>
        <Text style={ui.heading}>Your store at a glance</Text>
        <Text style={ui.body}>
          {store.products.length} products ·{" "}
          {store.products.filter((product) => product.hidden).length} hidden
        </Text>
        <Text style={ui.body}>
          {store.customers.length} customers · {store.orders.length} orders
        </Text>
        <Text style={ui.bold}>
          {money(store.orders.reduce((sum, order) => sum + order.total, 0))} in
          demo orders
        </Text>
      </View>
      <Button
        icon={Package}
        title="Manage products"
        onPress={() => router.push("/admin/products")}
      />
      <Button
        icon={Users}
        title="Customers & history"
        secondary
        onPress={() => router.push("/admin/clients")}
      />
      <Text style={ui.heading}>Recent orders</Text>
      <OrderList orders={store.orders.slice(0, 10)} />
      <Button
        icon={LogOut}
        title="Exit admin demo"
        secondary
        onPress={() => {
          setAdmin(false);
          router.replace("/profile");
        }}
      />
    </Screen>
  );
}
