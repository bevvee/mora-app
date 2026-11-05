import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../state/auth-provider";
import { StoreProvider } from "../state/store-provider";
import { colors } from "../components/shop/ui";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: colors.background,
            card: colors.background,
            text: colors.ink,
            primary: colors.accent,
            border: colors.border,
          },
        }}
      >
        <StoreProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
