import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../../state/store-provider";
import { money } from "../../domain/store";
import { Button, Empty, Field, Screen, ui } from "../../components/shop/ui";
export default function ClientsScreen() {
  const { store } = useStore();
  const [search, setSearch] = useState("");
  const customers = store.customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <Screen title="Customers" caption="LOCAL ADMIN" back>
      <Field label="Search customers" value={search} onChangeText={setSearch} />
      {!customers.length && (
        <Empty
          title="No matching customers"
          message="Try another name, email or phone number."
        />
      )}
      {customers.map((customer) => {
        const orders = store.orders.filter(
          (order) => order.customerId === customer.id,
        );
        return (
          <View key={customer.id} style={ui.card}>
            <Text style={ui.heading}>{customer.name}</Text>
            <Text style={ui.body}>
              {customer.email || "Profile not completed"}
            </Text>
            <Text style={ui.body}>
              {orders.length} orders ·{" "}
              {money(orders.reduce((sum, order) => sum + order.total, 0))}
            </Text>
            <Button
              title="View profile & history"
              secondary
              onPress={() =>
                router.push({
                  pathname: "/admin/clients/[id]",
                  params: { id: customer.id },
                })
              }
            />
          </View>
        );
      })}
    </Screen>
  );
}
