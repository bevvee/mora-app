import { useState } from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import Save from "lucide-react-native/icons/save";
import { useAuth } from "../../state/auth-provider";
import { useStore } from "../../state/store-provider";
import {
  Button,
  Empty,
  errorMessage,
  Screen,
  ui,
} from "../../components/shop/ui";
import { CustomerFields } from "./customer-fields";
export default function DetailsScreen() {
  const { store, commit } = useStore();
  const { account } = useAuth();
  const [draft, setDraft] = useState(() => ({
    ...store.customers.find(
      (customer) => customer.id === store.activeCustomerId,
    )!,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await commit({
        type: "save-customer",
        customer: { ...draft, email: account?.email ?? draft.email },
      });
      if (router.canGoBack()) router.back();
      else router.replace("/profile");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  if (!account)
    return (
      <Screen title="Personal information" back>
        <Empty
          title="Log in to your account"
          message="Your personal details belong to your local Mora account."
        />
        <Button title="Log in" onPress={() => router.replace("/login")} />
      </Screen>
    );
  return (
    <Screen
      title="Personal information"
      caption="YOUR PROFILE & DELIVERY DETAILS"
      back
    >
      <CustomerFields
        value={draft}
        onChange={setDraft}
        lockedEmail={account.email}
      />
      <Text style={ui.body}>
        Your sign-in email is linked to your local account. Delivery details are
        required when you place an order.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      <Button
        icon={Save}
        title={busy ? "Saving..." : "Save changes"}
        disabled={busy}
        onPress={() => {
          void save();
        }}
      />
    </Screen>
  );
}
