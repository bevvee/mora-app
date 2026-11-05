import { useSyncExternalStore } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Match the server's light render until web hydration finishes.
export function useColorScheme() {
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const colorScheme = useRNColorScheme();
  return hydrated ? colorScheme : "light";
}
