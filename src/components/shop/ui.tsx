import { productImageUri } from "../three/reference-assets";
import { useState, type ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { AppHeader } from "./app-header";
import { colors } from "./theme";
export { colors } from "./theme";

export const ui = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
    gap: 20,
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -1,
  },
  heading: { fontSize: 21, fontWeight: "600", color: colors.ink },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.muted,
    fontWeight: "600",
  },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  bold: { fontSize: 16, fontWeight: "600", color: colors.ink },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
  button: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
  },
  field: {
    minHeight: 50,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: colors.ink,
    fontSize: 16,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: colors.soft,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.soft,
  },
});
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  selected,
  icon: Icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  selected?: boolean;
  icon?: LucideIcon;
}) {
  const color = secondary ? colors.ink : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        {
          backgroundColor: secondary ? colors.soft : colors.accent,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
      ]}
    >
      {Icon && (
        <Icon size={19} strokeWidth={1.8} color={color} aria-hidden={true} />
      )}
      <Text style={[ui.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={ui.bold}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          ui.field,
          props.multiline && { minHeight: 100, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Screen({
  title,
  caption,
  children,
  back = false,
  footer,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
  back?: boolean;
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView style={ui.fill} edges={["top", "left", "right"]}>
      <AppHeader title={title} caption={caption} back={back} />
      <KeyboardAvoidingView
        style={ui.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={ui.content}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      {footer && (
        <SafeAreaView
          edges={["bottom"]}
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 820,
              alignSelf: "center",
              paddingHorizontal: 22,
              paddingVertical: 12,
            }}
          >
            {footer}
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}
export function Empty({ title, message }: { title: string; message: string }) {
  return (
    <View style={ui.card}>
      <Text style={ui.heading}>{title}</Text>
      <Text style={ui.body}>{message}</Text>
    </View>
  );
}
export function ProductImage({
  uri,
  large = false,
  label = "Product photo",
}: {
  uri: string;
  large?: boolean;
  label?: string;
}) {
  // Recycled cards may receive another URL without unmounting. Reset failed-image
  // state with the source so one broken photo cannot hide the next product.
  const resolved = productImageUri(uri);
  return (
    <ProductPhoto key={resolved} uri={resolved} large={large} label={label} />
  );
}
function ProductPhoto({
  uri,
  large,
  label,
}: {
  uri: string;
  large: boolean;
  label: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed || !uri ? (
    <View
      style={[
        ui.image,
        {
          aspectRatio: large ? 1.15 : 1,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Text style={ui.heading}>mora.</Text>
      <Text style={ui.body}>Beauty essential</Text>
    </View>
  ) : (
    <Image
      accessibilityLabel={label}
      source={{ uri }}
      style={[ui.image, large && { aspectRatio: 1.15 }]}
      onError={() => setFailed(true)}
    />
  );
}
export const errorMessage = (cause: unknown) =>
  cause instanceof Error
    ? cause.message
    : "Unable to save locally. Please try again.";
