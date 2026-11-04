import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Provider } from "react-redux";
import { Button, ui } from "../components/shop/ui";
import type { Action } from "../domain/store";
import { commitShop, createAppStore, hydrateShop, setAdmin } from "./app-store";
import { nativeServices } from "./native-services";
import { useAppDispatch, useAppSelector } from "./redux-hooks";

function ShopHydration({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.shop.hydration);
  const error = useAppSelector((state) => state.shop.hydrationError);
  useEffect(() => {
    void dispatch(hydrateShop());
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
              title="Retry loading"
              onPress={() => {
                void dispatch(hydrateShop());
              }}
            />
          </>
        ) : (
          <>
            <ActivityIndicator color="#745341" />
            <Text style={ui.body}>Opening your local Mora space...</Text>
          </>
        )}
      </View>
    );
  return children;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Keep the instance stable for this provider without sharing it across roots or requests.
  const [reduxStore] = useState(() => createAppStore(nativeServices));
  return (
    <Provider store={reduxStore}>
      <ShopHydration>{children}</ShopHydration>
    </Provider>
  );
}

export function useStore() {
  const dispatch = useAppDispatch();
  const store = useAppSelector((state) => state.shop.data);
  const admin = useAppSelector((state) => state.shop.admin);
  const commit = useCallback(
    async (action: Action) => {
      const outcome = await dispatch(commitShop(action));
      // RTK serializes rejected errors; screens expect Error instances for their messages.
      if (commitShop.rejected.match(outcome))
        throw new Error(outcome.error.message ?? "Could not save local data.");
    },
    [dispatch],
  );
  const changeAdmin = useCallback(
    (enabled: boolean) => {
      dispatch(setAdmin(enabled));
    },
    [dispatch],
  );
  if (!store) throw new Error("Local data is still loading.");
  return { store, admin, setAdmin: changeAdmin, commit };
}
