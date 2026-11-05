import { upgradeMoraCatalog } from "../domain/mora-catalog";
import {
  combineReducers,
  configureStore,
  createAction,
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
  type Action as ReduxAction,
  type ThunkAction,
  type ThunkDispatch,
  type UnknownAction,
} from "@reduxjs/toolkit";
import {
  emptyAuthData,
  normalizeEmail,
  parseAuthData,
  validateEmail,
  validatePassword,
  type AuthData,
  type PublicAccount,
  type SignUpInput,
} from "../domain/local-auth";
import {
  initialStore,
  parseStore,
  updateStore,
  type Action,
  type Store,
} from "../domain/store";

export const SHOP_STORAGE_KEY = "@mora/store/v1";
export const AUTH_STORAGE_KEY = "@mora/auth/v1";
const GUEST_ID = "local-customer";

export type AppDependencies = {
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
  };
  crypto: {
    digest: (value: string) => Promise<string>;
    randomUUID: () => string;
  };
};
type AppServices = AppDependencies & {
  run: <Result>(operation: () => Promise<Result>) => Promise<Result>;
};
type HydrationStatus = "idle" | "loading" | "ready" | "failed";
type ShopState = {
  data: Store | null;
  admin: boolean;
  hydration: HydrationStatus;
  hydrationError: string | null;
  pendingOperations: number;
  operationError: string | null;
};
type AuthState = {
  data: AuthData | null;
  hydration: HydrationStatus;
  hydrationError: string | null;
  pendingOperations: number;
  operationError: string | null;
};
export type RootState = { shop: ShopState; auth: AuthState };
type StateDispatch = ThunkDispatch<RootState, AppServices, UnknownAction>;
type AppThunk<Result> = ThunkAction<
  Result,
  RootState,
  AppServices,
  UnknownAction
>;
type ThunkConfig = { state: RootState; extra: AppServices };
type OperationContext = {
  auth: AuthData;
  dispatch: StateDispatch;
  getState: () => RootState;
  services: AppServices;
};

const message = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Could not save local data.";
const sessionApplied = createAction<{ auth: AuthData; shop: Store }>(
  "session/applied",
);
const initialShop: ShopState = {
  data: null,
  admin: false,
  hydration: "idle",
  hydrationError: null,
  pendingOperations: 0,
  operationError: null,
};
const initialAuth: AuthState = {
  data: null,
  hydration: "idle",
  hydrationError: null,
  pendingOperations: 0,
  operationError: null,
};

const shopSlice = createSlice({
  name: "shop",
  initialState: initialShop,
  reducers: {
    hydrated(state, action: PayloadAction<Store>) {
      state.data = action.payload;
      state.hydration = "ready";
      state.hydrationError = null;
    },
    committed(state, action: PayloadAction<Store>) {
      state.data = action.payload;
    },
    adminChanged(state, action: PayloadAction<boolean>) {
      state.admin = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionApplied, (state, action) => {
        state.data = action.payload.shop;
        state.admin = false;
      })
      .addCase(hydrateShop.pending, (state) => {
        state.hydration = "loading";
        state.hydrationError = null;
      })
      .addCase(hydrateShop.rejected, (state, action) => {
        state.hydration = "failed";
        state.hydrationError =
          action.error.message ?? "Could not load local data.";
      })
      .addCase(commitShop.pending, (state) => {
        state.pendingOperations += 1;
        state.operationError = null;
      })
      .addCase(commitShop.fulfilled, (state) => {
        state.pendingOperations -= 1;
      })
      .addCase(commitShop.rejected, (state, action) => {
        state.pendingOperations -= 1;
        state.operationError =
          action.error.message ?? "Could not save local data.";
      });
  },
});

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuth,
  reducers: {
    committed(state, action: PayloadAction<AuthData>) {
      state.data = action.payload;
    },
    operationStarted(state) {
      state.pendingOperations += 1;
      state.operationError = null;
    },
    operationSucceeded(state) {
      state.pendingOperations -= 1;
    },
    operationFailed(state, action: PayloadAction<string>) {
      state.pendingOperations -= 1;
      state.operationError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionApplied, (state, action) => {
        state.data = action.payload.auth;
        state.hydration = "ready";
        state.hydrationError = null;
      })
      .addCase(hydrateAuth.pending, (state) => {
        state.hydration = "loading";
        state.hydrationError = null;
      })
      .addCase(hydrateAuth.rejected, (state, action) => {
        state.hydration = "failed";
        state.hydrationError =
          action.error.message ?? "Could not load local accounts.";
      });
  },
});

function requireShop(state: RootState): Store {
  if (!state.shop.data) throw new Error("Local data is still loading.");
  return state.shop.data;
}
function requireAuth(state: RootState): AuthData {
  if (!state.auth.data) throw new Error("Local accounts are still loading.");
  return state.auth.data;
}

export const hydrateShop = createAsyncThunk<void, void, ThunkConfig>(
  "shop/hydrate",
  async (_, { dispatch, extra }) =>
    extra.run(async () => {
      const raw = await extra.storage.getItem(SHOP_STORAGE_KEY);
      const previous = raw ? parseStore(raw) : initialStore();
      const upgraded = upgradeMoraCatalog(previous);
      if (raw && upgraded !== previous)
        await extra.storage.setItem(SHOP_STORAGE_KEY, JSON.stringify(upgraded));
      // Publish only after the migration is durable, keeping queued writes safe.
      dispatch(shopSlice.actions.hydrated(upgraded));
    }),
  {
    condition: (_, { getState }) =>
      ["idle", "failed"].includes(getState().shop.hydration),
  },
);

export const hydrateAuth = createAsyncThunk<void, void, ThunkConfig>(
  "auth/hydrate",
  async (_, { dispatch, getState, extra }) =>
    extra.run(async () => {
      const shop = requireShop(getState());
      const raw = await extra.storage.getItem(AUTH_STORAGE_KEY);
      const auth = raw ? parseAuthData(raw) : emptyAuthData();
      const activeId = auth.sessionCustomerId ?? GUEST_ID;
      if (!shop.customers.some((customer) => customer.id === activeId))
        throw new Error(
          "The saved local profile could not be found. Your data has been preserved.",
        );
      const next =
        shop.activeCustomerId === activeId
          ? shop
          : updateStore(shop, { type: "switch-customer", id: activeId });
      if (next !== shop)
        await extra.storage.setItem(SHOP_STORAGE_KEY, JSON.stringify(next));
      dispatch(sessionApplied({ auth, shop: next }));
    }),
  {
    condition: (_, { getState }) =>
      ["idle", "failed"].includes(getState().auth.hydration),
  },
);

export const setAdmin = shopSlice.actions.adminChanged;
export const commitShop = createAsyncThunk<void, Action, ThunkConfig>(
  "shop/commit",
  async (action, { dispatch, getState, extra }) =>
    extra.run(async () => {
      const state = getState();
      const shop = requireShop(state);
      if (
        (action.type === "save-product" || action.type === "delete-product") &&
        !state.shop.admin
      )
        throw new Error("Open the local admin demo first.");
      if (
        action.type === "save-customer" &&
        action.customer.id !== shop.activeCustomerId &&
        shop.customers.some((customer) => customer.id === action.customer.id)
      )
        throw new Error("You can only edit your active profile.");
      const next = updateStore(shop, action);
      await extra.storage.setItem(SHOP_STORAGE_KEY, JSON.stringify(next));
      dispatch(shopSlice.actions.committed(next));
    }),
);

function authOperation<Result>(
  operation: (context: OperationContext) => Promise<Result>,
): AppThunk<Promise<Result>> {
  return (dispatch, getState, services) => {
    dispatch(authSlice.actions.operationStarted());
    return services.run(async () => {
      try {
        const result = await operation({
          auth: requireAuth(getState()),
          dispatch,
          getState,
          services,
        });
        dispatch(authSlice.actions.operationSucceeded());
        return result;
      } catch (cause) {
        dispatch(authSlice.actions.operationFailed(message(cause)));
        throw cause;
      }
    });
  };
}

async function transition(
  context: OperationContext,
  auth: AuthData,
): Promise<void> {
  const { dispatch, getState, services } = context;
  const previous = requireAuth(getState());
  const shop = updateStore(requireShop(getState()), {
    type: "switch-customer",
    id: auth.sessionCustomerId ?? GUEST_ID,
  });
  await services.storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  try {
    await services.storage.setItem(SHOP_STORAGE_KEY, JSON.stringify(shop));
  } catch (cause) {
    try {
      await services.storage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(previous),
      );
    } catch {
      throw new Error(
        `${message(cause)} Restoring the saved account also failed. Retry the account action to restore local consistency.`,
      );
    }
    throw cause;
  }
  // Both slices change in one dispatch after both writes succeed.
  dispatch(sessionApplied({ auth, shop }));
}

// Plaintext secrets stay in thunk closures and return values, never Redux actions or state.
export function signUp(
  input: SignUpInput,
): AppThunk<Promise<{ recoveryCode: string }>> {
  return authOperation(async (context) => {
    const { auth, dispatch, getState, services } = context;
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    if (!name) throw new Error("Enter your full name.");
    validateEmail(email);
    validatePassword(input.password);
    if (auth.accounts.some((account) => account.email === email))
      throw new Error(
        "An account with this email already exists on this device.",
      );
    const customerId = `account-${(await services.crypto.digest(email)).slice(0, 24)}`;
    const passwordSalt = services.crypto.randomUUID();
    const recoverySalt = services.crypto.randomUUID();
    const recoveryCode = services.crypto.randomUUID();
    const [passwordHash, recoveryHash] = await Promise.all([
      services.crypto.digest(`${passwordSalt}:${input.password}`),
      services.crypto.digest(`${recoverySalt}:${recoveryCode}`),
    ]);
    const shop = requireShop(getState());
    // An orphaned profile from a failed account write is reused on retry.
    if (!shop.customers.some((customer) => customer.id === customerId)) {
      const next = updateStore(shop, {
        type: "register-customer",
        customer: {
          id: customerId,
          name,
          email,
          phone: "",
          address: "",
          city: "",
        },
      });
      await services.storage.setItem(SHOP_STORAGE_KEY, JSON.stringify(next));
      dispatch(shopSlice.actions.committed(next));
    }
    await transition(context, {
      ...auth,
      accounts: [
        ...auth.accounts,
        {
          customerId,
          email,
          passwordSalt,
          passwordHash,
          recoverySalt,
          recoveryHash,
        },
      ],
      sessionCustomerId: customerId,
    });
    return { recoveryCode };
  });
}

export function signIn(
  emailInput: string,
  password: string,
): AppThunk<Promise<void>> {
  return authOperation(async (context) => {
    const email = normalizeEmail(emailInput);
    const account = context.auth.accounts.find((item) => item.email === email);
    if (
      !account ||
      (await context.services.crypto.digest(
        `${account.passwordSalt}:${password}`,
      )) !== account.passwordHash
    )
      throw new Error("Email or password is incorrect for this device.");
    await transition(context, {
      ...context.auth,
      sessionCustomerId: account.customerId,
    });
  });
}

export function signOut(): AppThunk<Promise<void>> {
  return authOperation(async (context) => {
    await transition(context, { ...context.auth, sessionCustomerId: null });
  });
}

export function resetPassword(
  emailInput: string,
  recoveryCode: string,
  newPassword: string,
): AppThunk<Promise<void>> {
  return authOperation(async (context) => {
    const { auth, dispatch, services } = context;
    validatePassword(newPassword);
    const email = normalizeEmail(emailInput);
    const account = auth.accounts.find((item) => item.email === email);
    if (
      !account ||
      (await services.crypto.digest(
        `${account.recoverySalt}:${recoveryCode.trim().toLowerCase()}`,
      )) !== account.recoveryHash
    )
      throw new Error("Email or recovery code is incorrect for this device.");
    const passwordSalt = services.crypto.randomUUID();
    const passwordHash = await services.crypto.digest(
      `${passwordSalt}:${newPassword}`,
    );
    const updated: AuthData = {
      ...auth,
      accounts: auth.accounts.map((item) =>
        item.customerId === account.customerId
          ? { ...item, passwordSalt, passwordHash }
          : item,
      ),
      sessionCustomerId:
        auth.sessionCustomerId === account.customerId
          ? null
          : auth.sessionCustomerId,
    };
    if (updated.sessionCustomerId !== auth.sessionCustomerId)
      await transition(context, updated);
    else {
      await services.storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      dispatch(authSlice.actions.committed(updated));
    }
  });
}

const publicAuth = (auth: AuthData | null) =>
  auth && {
    ...auth,
    accounts: auth.accounts.map(({ customerId, email }) => ({
      customerId,
      email,
    })),
  };

export function sanitizeState(state: RootState) {
  return {
    ...state,
    auth: { ...state.auth, data: publicAuth(state.auth.data) },
  };
}
export function sanitizeAction(action: UnknownAction): UnknownAction {
  if (sessionApplied.match(action))
    return {
      ...action,
      payload: { ...action.payload, auth: publicAuth(action.payload.auth) },
    };
  if (authSlice.actions.committed.match(action))
    return { ...action, payload: publicAuth(action.payload) };
  return action;
}

const reducer = combineReducers({
  shop: shopSlice.reducer,
  auth: authSlice.reducer,
});

export function createAppStore(dependencies: AppDependencies) {
  // The queue belongs to this store instance; no application data lives outside Redux.
  let tail: Promise<void> = Promise.resolve();
  const services: AppServices = {
    ...dependencies,
    run(operation) {
      const next = tail.then(operation);
      tail = next.then(
        () => undefined,
        () => undefined,
      );
      return next;
    },
  };
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: services } }),
    devTools: {
      stateSanitizer: <State>(state: State): State =>
        sanitizeState(state as RootState) as State,
      actionSanitizer: <ActionType extends ReduxAction>(
        action: ActionType,
      ): ActionType => sanitizeAction(action as UnknownAction) as ActionType,
    },
  });
}
export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

export const selectAccount = createSelector(
  [(state: RootState) => state.auth.data],
  (auth): PublicAccount | null => {
    const account = auth?.accounts.find(
      (item) => item.customerId === auth.sessionCustomerId,
    );
    return account
      ? { customerId: account.customerId, email: account.email }
      : null;
  },
);
