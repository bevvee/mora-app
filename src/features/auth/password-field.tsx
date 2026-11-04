import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import { IconButton } from "../../components/shop/app-header";
import { colors, ui } from "../../components/shop/ui";
export function PasswordField({
  label = "Password",
  value,
  onChangeText,
  newPassword = false,
}: {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  newPassword?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={ui.bold}>{label}</Text>
      <View
        style={[
          ui.field,
          {
            paddingVertical: 2,
            paddingRight: 3,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          placeholder={
            newPassword ? "At least 8 characters" : "Enter your password"
          }
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={newPassword ? "new-password" : "current-password"}
          style={{ flex: 1, color: colors.ink, minHeight: 48, fontSize: 16 }}
        />
        <IconButton
          icon={visible ? EyeOff : Eye}
          label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          onPress={() => setVisible(!visible)}
        />
      </View>
    </View>
  );
}
