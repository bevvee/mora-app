import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import LogIn from "lucide-react-native/icons/log-in";
import Sparkles from "lucide-react-native/icons/sparkles";
import { useAuth } from "../../state/auth-provider";
import {
  Button,
  colors,
  errorMessage,
  Field,
  Screen,
  ui,
} from "../../components/shop/ui";
import { PasswordField } from "./password-field";
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login() {
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/profile");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen title="Log in" caption="YOUR MORA ACCOUNT" back>
      <View style={{ gap: 12 }}>
        <Sparkles size={30} color={colors.accent} strokeWidth={1.4} />
        <Text style={ui.title}>Welcome back.</Text>
        <Text style={ui.body}>
          Your essentials and beauty rituals, all in one little space.
        </Text>
      </View>
      <Field
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
      />
      <PasswordField value={password} onChangeText={setPassword} />
      <Button
        title="Forgot password?"
        secondary
        disabled={busy}
        onPress={() => router.push("/forgot-password")}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      <Button
        icon={LogIn}
        title={busy ? "Logging in..." : "Log in"}
        disabled={busy}
        onPress={() => {
          void login();
        }}
      />
      <View style={ui.card}>
        <Text style={ui.body}>New to Mora?</Text>
        <Button
          title="Create an account"
          secondary
          disabled={busy}
          onPress={() => router.replace("/signup")}
        />
      </View>
      <Text style={ui.body}>
        Local demo: your account stays on this device.
      </Text>
    </Screen>
  );
}
