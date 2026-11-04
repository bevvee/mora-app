import { Slot } from "expo-router";
import { Text } from "react-native";
import { useStore } from "../../state/store-provider";
import { Button, Screen, ui } from "../../components/shop/ui";
export default function AdminLayout() {
  const { admin, setAdmin } = useStore();
  if (!admin)
    return (
      <Screen title="Admin demo" caption="LOCAL WORKSPACE" back>
        <Text style={ui.body}>
          Manage products and view all customer profiles and order history
          stored on this device. This is a local demo with no authentication.
        </Text>
        <Button title="Enter admin demo" onPress={() => setAdmin(true)} />
      </Screen>
    );
  return <Slot />;
}
