import { useCallback, useEffect, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Button, ui } from "../components/shop/ui";
import type { SignUpInput } from "../domain/local-auth";
import {
  hydrateAuth,
  resetPassword,
  selectAccount,
  signIn,
  signOut,
  signUp,
} from "./app-store";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.hydration);
  const error = useAppSelector((state) => state.auth.hydrationError);
  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);
  if (status !== "ready")
    return (
      <View style={[ui.fill, ui.center]}>
        {error ? (
          <>
            <Text accessibilityRole="alert" style={ui.error}>
              {error}
            </Text>
            <Button
              title="Retry loading accounts"
              onPress={() => {
                void dispatch(hydrateAuth());
              }}
            />
          </>
        ) : (
          <>
            <ActivityIndicator color="#745341" />
            <Text style={ui.body}>Opening your local account...</Text>
          </>
        )}
      </View>
    );
  return children;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const ready = useAppSelector((state) => state.auth.hydration === "ready");
  const account = useAppSelector(selectAccount);
  return {
    ready,
    account,
    signUp: useCallback(
      (input: SignUpInput) => dispatch(signUp(input)),
      [dispatch],
    ),
    signIn: useCallback(
      (email: string, password: string) => dispatch(signIn(email, password)),
      [dispatch],
    ),
    signOut: useCallback(() => dispatch(signOut()), [dispatch]),
    resetPassword: useCallback(
      (email: string, recoveryCode: string, newPassword: string) =>
        dispatch(resetPassword(email, recoveryCode, newPassword)),
      [dispatch],
    ),
  };
}
