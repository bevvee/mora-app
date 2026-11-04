import { Text, View } from "react-native";
import { Screen, ui } from "../components/shop/ui";
export default function AboutScreen() {
  return (
    <Screen title="About Mora" caption="YOUR EVERYDAY GLOW" back>
      <View style={ui.card}>
        <Text style={ui.heading}>A little care. A lot of glow.</Text>
        <Text style={ui.body}>
          Explore beauty essentials, save your details and revisit your order
          history in your personal Mora space.
        </Text>
      </View>
      <View style={ui.card}>
        <Text style={ui.heading}>Your local workspace</Text>
        <Text style={ui.body}>
          Accounts, products and orders are saved on this device. No Firebase or
          backend is connected. Product photos may need an internet connection.
        </Text>
        <Text style={ui.body}>
          Checkout is a demo and does not charge money. Password recovery uses
          the recovery code shown when you create your account; no email is
          sent.
        </Text>
      </View>
    </Screen>
  );
}
