import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import type { AppDependencies } from "./app-store";

export const nativeServices: AppDependencies = {
  storage: AsyncStorage,
  crypto: {
    digest: (value) =>
      Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value),
    randomUUID: () => Crypto.randomUUID(),
  },
};
