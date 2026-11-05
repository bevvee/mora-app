import { View } from "react-native";
import { type Customer } from "../../domain/store";
import { Field } from "../../components/shop/ui";
export function CustomerFields({
  value,
  onChange,
  lockedEmail,
}: {
  value: Customer;
  lockedEmail?: string;
  onChange: (value: Customer) => void;
}) {
  const field = (key: keyof Customer) => (text: string) =>
    onChange({ ...value, [key]: text });
  return (
    <View style={{ gap: 16 }}>
      <Field
        label="Full name"
        value={value.name}
        onChangeText={field("name")}
        autoComplete="name"
      />
      <Field
        label="Email"
        value={lockedEmail ?? value.email}
        editable={!lockedEmail}
        onChangeText={field("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label="Phone"
        value={value.phone}
        onChangeText={field("phone")}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <Field
        label="Delivery address"
        value={value.address}
        onChangeText={field("address")}
        autoComplete="street-address"
      />
      <Field label="City" value={value.city} onChangeText={field("city")} />
    </View>
  );
}
