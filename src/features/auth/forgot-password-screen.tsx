import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import Check from "lucide-react-native/icons/check";
import KeyRound from "lucide-react-native/icons/key-round";
import { useAuth } from "../../state/auth-provider";
import {
  Button,
  errorMessage,
  Field,
  Screen,
  ui,
} from "../../components/shop/ui";
import { PasswordField } from "./password-field";
export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function reset() {
    setError("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email, code, password);
      setDone(true);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen title="Forgot password" caption="LET'S GET YOU BACK IN" back>
      {done ? (
        <>
          <View style={ui.card}>
            <Text style={ui.heading}>Password updated</Text>
            <Text style={ui.body}>
              You can now log in to your local account with your new password.
            </Text>
          </View>
          <Button
            title="Back to login"
            icon={Check}
            onPress={() => router.replace("/login")}
          />
        </>
      ) : (
        <>
          <Text style={ui.body}>
            Enter your email and the recovery code saved when you created your
            account. Recovery works on this device; no email is sent.
          </Text>
          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />
          <Field
            label="Recovery code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Your saved recovery code"
          />
          <PasswordField
            label="New password"
            value={password}
            onChangeText={setPassword}
            newPassword
          />
          <PasswordField
            label="Confirm new password"
            value={confirmation}
            onChangeText={setConfirmation}
            newPassword
          />
          {!!error && (
            <Text accessibilityRole="alert" style={ui.error}>
              {error}
            </Text>
          )}
          <Button
            title={busy ? "Resetting password..." : "Reset password"}
            icon={KeyRound}
            disabled={busy}
            onPress={() => {
              void reset();
            }}
          />
        </>
      )}
    </Screen>
  );
}
