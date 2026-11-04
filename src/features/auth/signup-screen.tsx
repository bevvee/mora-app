import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import KeyRound from "lucide-react-native/icons/key-round";
import UserPlus from "lucide-react-native/icons/user-plus";
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
export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function signup() {
    setError("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await signUp({ name, email, password });
      setRecoveryCode(result.recoveryCode);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  if (recoveryCode)
    return (
      <Screen title="Account created" caption="WELCOME TO YOUR MORA SPACE">
        <View style={ui.card}>
          <KeyRound color={colors.accent} size={30} />
          <Text style={ui.heading}>Save your recovery code</Text>
          <Text style={ui.body}>
            Use this code on the forgot-password page if you need to reset your
            password. No recovery email is sent in this local demo.
          </Text>
          <Text selectable style={[ui.bold, { lineHeight: 26 }]}>
            {recoveryCode}
          </Text>
          <Text style={ui.body}>
            Keep it somewhere you can find it. It is shown only now.
          </Text>
        </View>
        <Button
          title="I've saved my code"
          onPress={() => router.replace("/profile")}
        />
      </Screen>
    );
  return (
    <Screen title="Create account" caption="YOUR MORA JOURNEY STARTS HERE" back>
      <View style={{ gap: 8 }}>
        <Text style={ui.title}>Make yourself at home.</Text>
        <Text style={ui.body}>
          Create your local account for a personal profile and order history.
        </Text>
      </View>
      <Field
        label="Full name"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        placeholder="Your name"
      />
      <Field
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
      />
      <PasswordField value={password} onChangeText={setPassword} newPassword />
      <PasswordField
        label="Confirm password"
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
        title={busy ? "Creating account..." : "Create account"}
        icon={UserPlus}
        disabled={busy}
        onPress={() => {
          void signup();
        }}
      />
      <Button
        title="Already have an account? Log in"
        secondary
        disabled={busy}
        onPress={() => router.replace("/login")}
      />
      <Text style={ui.body}>
        Demo accounts are stored only on this device. Use a password for this
        demo.
      </Text>
    </Screen>
  );
}
