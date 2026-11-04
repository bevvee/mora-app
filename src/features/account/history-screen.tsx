import { useStore } from "../../state/store-provider";
import { Screen } from "../../components/shop/ui";
import { OrderList } from "./order-list";
export default function HistoryScreen() {
  const { store } = useStore();
  return (
    <Screen title="My order history" caption="YOUR BEAUTY JOURNEY" back>
      <OrderList
        orders={store.orders.filter(
          (order) => order.customerId === store.activeCustomerId,
        )}
      />
    </Screen>
  );
}
