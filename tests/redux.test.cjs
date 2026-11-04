const assert = require("node:assert/strict");
const { createHash, randomUUID } = require("node:crypto");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");
const { initialStore, updateStore } = require("../src/domain/store.ts");
const { emptyAuthData } = require("../src/domain/local-auth.ts");

// Metro resolves extensionless TS imports; Node's native TS loader does not.
// Compile the real store in memory, keeping production imports suitable for Expo.
const filename = require.resolve("../src/state/app-store.ts");
const source = fs
  .readFileSync(filename, "utf8")
  .replace(
    /from "\.\.\/domain\/(store|local-auth)"/g,
    'from "../domain/$1.ts"',
  );
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(path.dirname(filename));
loaded._compile(compiled, filename);
const {
  AUTH_STORAGE_KEY,
  SHOP_STORAGE_KEY,
  commitShop,
  createAppStore,
  hydrateAuth,
  hydrateShop,
  resetPassword,
  sanitizeAction,
  sanitizeState,
  selectAccount,
  setAdmin,
  signIn,
  signOut,
  signUp,
} = loaded.exports;

const digest = async (value) =>
  createHash("sha256").update(value).digest("hex");
const crypto = { digest, randomUUID };
const input = {
  name: "Amal Idrissi",
  email: "Amal@Example.com",
  password: "local-password",
};
const shipping = (id) => ({
  id,
  name: "Amal Idrissi",
  email: "amal@example.com",
  phone: "+212 612345678",
  address: "12 Rue des Fleurs",
  city: "Casablanca",
});
function fixture(seed = {}) {
  const values = new Map(Object.entries(seed));
  const reads = [];
  const writes = [];
  const storage = {
    async getItem(key) {
      reads.push(key);
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      writes.push({ key, value });
      values.set(key, value);
    },
  };
  return {
    values,
    reads,
    writes,
    storage,
    store: createAppStore({ storage, crypto }),
  };
}
async function boot(seed) {
  const result = fixture(seed);
  await result.store.dispatch(hydrateShop()).unwrap();
  await result.store.dispatch(hydrateAuth()).unwrap();
  return result;
}
const commit = (store, action) => store.dispatch(commitShop(action)).unwrap();
const add = (store, amount = 1) =>
  commit(store, { type: "cart", productId: "serum", amount });
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function savedAccount(email = "amal@example.com", id = "saved-account") {
  return {
    customerId: id,
    email,
    passwordSalt: "saved-password-salt",
    passwordHash: await digest("saved-password-salt:local-password"),
    recoverySalt: "saved-recovery-salt",
    recoveryHash: await digest("saved-recovery-salt:saved-code"),
  };
}

test("hydrates existing v1 shop, order snapshots, account hashes and active session without rewriting", async () => {
  const account = await savedAccount();
  let shop = initialStore();
  shop.customers.push(shipping(account.customerId));
  shop.activeCustomerId = account.customerId;
  shop = updateStore(shop, { type: "cart", productId: "serum", amount: 2 });
  shop = updateStore(shop, {
    type: "checkout",
    id: "saved-order",
    createdAt: "2026-11-04T12:00:00.000Z",
    shipping: shipping(account.customerId),
    payment: "cash",
  });
  shop = updateStore(shop, { type: "cart", productId: "cream", amount: 1 });
  const auth = {
    version: 1,
    accounts: [account],
    sessionCustomerId: account.customerId,
  };
  const result = await boot({
    [SHOP_STORAGE_KEY]: JSON.stringify(shop),
    [AUTH_STORAGE_KEY]: JSON.stringify(auth),
  });
  assert.deepEqual(result.store.getState().shop.data, shop);
  assert.deepEqual(result.store.getState().auth.data, auth);
  assert.deepEqual(selectAccount(result.store.getState()), {
    customerId: account.customerId,
    email: account.email,
  });
  assert.equal(result.store.getState().shop.hydration, "ready");
  assert.equal(result.store.getState().auth.hydration, "ready");
  assert.equal(result.writes.length, 0);
});

test("an existing signed-out install reconciles the active guest and clears only its old cart", async () => {
  const shop = initialStore();
  shop.customers.push(shipping("old-profile"));
  shop.activeCustomerId = "old-profile";
  shop.cart = [{ productId: "serum", quantity: 1 }];
  const result = await boot({ [SHOP_STORAGE_KEY]: JSON.stringify(shop) });
  assert.deepEqual(result.store.getState().shop.data, {
    ...shop,
    activeCustomerId: "local-customer",
    cart: [],
  });
  assert.deepEqual(result.store.getState().auth.data, emptyAuthData());
  assert.equal(result.writes.length, 1);
  assert.equal(result.writes[0].key, SHOP_STORAGE_KEY);
});

test("corrupt stored shop data is preserved and hydration can be retried", async () => {
  const result = fixture({ [SHOP_STORAGE_KEY]: "unreadable-json" });
  await assert.rejects(result.store.dispatch(hydrateShop()).unwrap());
  assert.equal(result.store.getState().shop.data, null);
  assert.equal(result.store.getState().shop.hydration, "failed");
  assert.ok(result.store.getState().shop.hydrationError);
  assert.equal(result.values.get(SHOP_STORAGE_KEY), "unreadable-json");
  assert.equal(result.writes.length, 0);
  result.values.set(SHOP_STORAGE_KEY, JSON.stringify(initialStore()));
  await result.store.dispatch(hydrateShop()).unwrap();
  assert.equal(result.store.getState().shop.hydration, "ready");
  assert.equal(result.store.getState().shop.hydrationError, null);
});

test("invalid auth or a missing saved session profile is preserved instead of replaced", async () => {
  for (const raw of [
    "invalid-json",
    JSON.stringify({
      version: 1,
      accounts: [await savedAccount()],
      sessionCustomerId: "saved-account",
    }),
  ]) {
    const result = fixture({ [AUTH_STORAGE_KEY]: raw });
    await result.store.dispatch(hydrateShop()).unwrap();
    await assert.rejects(result.store.dispatch(hydrateAuth()).unwrap());
    assert.equal(result.store.getState().auth.data, null);
    assert.equal(result.store.getState().auth.hydration, "failed");
    assert.equal(result.values.get(AUTH_STORAGE_KEY), raw);
    assert.equal(result.writes.length, 0);
    result.values.set(AUTH_STORAGE_KEY, JSON.stringify(emptyAuthData()));
    await result.store.dispatch(hydrateAuth()).unwrap();
    assert.equal(result.store.getState().auth.hydration, "ready");
    assert.equal(result.store.getState().auth.hydrationError, null);
  }
});

test("duplicate hydration requests share no extra reads or initialization", async () => {
  const result = fixture();
  const first = result.store.dispatch(hydrateShop());
  const duplicate = result.store.dispatch(hydrateShop());
  await first.unwrap();
  assert.equal((await duplicate).meta.condition, true);
  await result.store.dispatch(hydrateAuth()).unwrap();
  assert.deepEqual(result.reads, [SHOP_STORAGE_KEY, AUTH_STORAGE_KEY]);
});

test("provider store instances isolate auth, admin, catalog and cart state", async () => {
  const [first, second] = await Promise.all([boot(), boot()]);
  await first.store.dispatch(signUp(input));
  first.store.dispatch(setAdmin(true));
  const product = {
    ...first.store.getState().shop.data.products[0],
    price: 321,
  };
  await commit(first.store, { type: "save-product", product });
  await add(first.store);
  assert.equal(selectAccount(second.store.getState()), null);
  assert.equal(second.store.getState().auth.data.accounts.length, 0);
  assert.equal(second.store.getState().shop.admin, false);
  assert.equal(second.store.getState().shop.data.products[0].price, 189);
  assert.deepEqual(second.store.getState().shop.data.cart, []);
  assert.equal(second.values.size, 0);
});

test("queued cart writes read the latest durable state and publish only after storage succeeds", async () => {
  const result = await boot();
  const entered = deferred();
  const release = deferred();
  const save = result.storage.setItem;
  let calls = 0;
  result.storage.setItem = async (key, value) => {
    calls += 1;
    if (calls === 1) {
      entered.resolve();
      await release.promise;
    }
    await save(key, value);
  };
  const first = add(result.store, 1);
  await entered.promise;
  const second = add(result.store, 2);
  assert.equal(calls, 1);
  assert.deepEqual(result.store.getState().shop.data.cart, []);
  assert.equal(result.store.getState().shop.pendingOperations, 2);
  release.resolve();
  await Promise.all([first, second]);
  const expected = [{ productId: "serum", quantity: 3 }];
  assert.deepEqual(result.store.getState().shop.data.cart, expected);
  assert.deepEqual(
    JSON.parse(result.values.get(SHOP_STORAGE_KEY)).cart,
    expected,
  );
  assert.equal(result.store.getState().shop.pendingOperations, 0);
});

test("a rejected queued write leaves the previous state and does not poison later transactions", async () => {
  const result = await boot();
  const save = result.storage.setItem;
  let fail = true;
  result.storage.setItem = async (key, value) => {
    if (fail) {
      fail = false;
      throw new Error("Disk full");
    }
    await save(key, value);
  };
  const first = add(result.store, 1);
  const second = add(result.store, 2);
  await Promise.all([assert.rejects(first, { message: "Disk full" }), second]);
  assert.deepEqual(result.store.getState().shop.data.cart, [
    { productId: "serum", quantity: 2 },
  ]);
  assert.deepEqual(
    JSON.parse(result.values.get(SHOP_STORAGE_KEY)),
    result.store.getState().shop.data,
  );
  assert.equal(result.store.getState().shop.pendingOperations, 0);
});

test("admin and active-customer guards reject mutations before persistence", async () => {
  const shop = initialStore();
  shop.customers.push(shipping("other-profile"));
  const result = await boot({ [SHOP_STORAGE_KEY]: JSON.stringify(shop) });
  await assert.rejects(
    commit(result.store, { type: "delete-product", id: "serum" }),
    { message: "Open the local admin demo first." },
  );
  await assert.rejects(
    commit(result.store, {
      type: "save-customer",
      customer: shipping("other-profile"),
    }),
    { message: "You can only edit your active profile." },
  );
  assert.equal(result.writes.length, 0);
  result.store.dispatch(setAdmin(true));
  await commit(result.store, { type: "delete-product", id: "serum" });
  assert.equal(
    result.store
      .getState()
      .shop.data.products.some((item) => item.id === "serum"),
    false,
  );
});

test("signup, login, signout and recovery retain salted hashes without plaintext secrets in persisted or Redux state", async () => {
  const result = await boot();
  const { recoveryCode } = await result.store.dispatch(signUp(input));
  const account = result.store.getState().auth.data.accounts[0];
  assert.equal(account.email, "amal@example.com");
  assert.equal(
    account.passwordHash,
    await digest(`${account.passwordSalt}:${input.password}`),
  );
  assert.equal(
    account.recoveryHash,
    await digest(`${account.recoverySalt}:${recoveryCode}`),
  );
  assert.notEqual(account.passwordSalt, account.recoverySalt);
  assert.equal(
    result.store.getState().shop.data.activeCustomerId,
    account.customerId,
  );
  await assert.rejects(result.store.dispatch(signUp(input)), /already exists/);
  await add(result.store);
  result.store.dispatch(setAdmin(true));
  await result.store.dispatch(signOut());
  assert.equal(selectAccount(result.store.getState()), null);
  assert.equal(result.store.getState().shop.admin, false);
  assert.deepEqual(result.store.getState().shop.data.cart, []);
  await assert.rejects(
    result.store.dispatch(signIn(input.email, "wrong-password")),
    /incorrect/,
  );
  await result.store.dispatch(signIn("  AMAL@EXAMPLE.COM  ", input.password));
  const previous = result.store.getState().auth.data;
  await assert.rejects(
    result.store.dispatch(
      resetPassword(input.email, "wrong-code", "changed-password"),
    ),
    /recovery code is incorrect/,
  );
  assert.deepEqual(result.store.getState().auth.data, previous);
  await result.store.dispatch(
    resetPassword(
      input.email,
      ` ${recoveryCode.toUpperCase()} `,
      "changed-password",
    ),
  );
  assert.equal(selectAccount(result.store.getState()), null);
  await assert.rejects(
    result.store.dispatch(signIn(input.email, input.password)),
    /incorrect/,
  );
  await result.store.dispatch(signIn(input.email, "changed-password"));
  const serialized =
    JSON.stringify(result.store.getState()) +
    [...result.values.values()].join("");
  for (const secret of [input.password, "changed-password", recoveryCode])
    assert.equal(serialized.includes(secret), false);
  assert.equal(result.store.getState().auth.pendingOperations, 0);
  const restarted = await boot(Object.fromEntries(result.values));
  assert.equal(
    selectAccount(restarted.store.getState()).customerId,
    account.customerId,
  );
});

test("DevTools sanitizers remove credential hashes and salts from auth state and actions", async () => {
  const result = await boot();
  await result.store.dispatch(signUp(input));
  const state = result.store.getState();
  const action = {
    type: "session/applied",
    payload: { auth: state.auth.data, shop: state.shop.data },
  };
  const account = state.auth.data.accounts[0];
  for (const redacted of [
    sanitizeState(state),
    sanitizeAction(action),
    sanitizeAction({ type: "auth/committed", payload: state.auth.data }),
  ]) {
    const raw = JSON.stringify(redacted);
    for (const key of [
      "passwordSalt",
      "passwordHash",
      "recoverySalt",
      "recoveryHash",
    ])
      assert.equal(raw.includes(account[key]), false);
    assert.ok(raw.includes(account.customerId));
  }
});

test("signup retries reuse the deterministic customer after the first account write fails", async () => {
  const result = await boot();
  const save = result.storage.setItem;
  let fail = true;
  result.storage.setItem = async (key, value) => {
    if (key === AUTH_STORAGE_KEY && fail) {
      fail = false;
      throw new Error("Account storage unavailable");
    }
    await save(key, value);
  };
  await assert.rejects(
    result.store.dispatch(signUp(input)),
    /storage unavailable/,
  );
  assert.equal(result.store.getState().auth.data.accounts.length, 0);
  assert.equal(result.store.getState().shop.data.customers.length, 2);
  const id = result.store.getState().shop.data.customers[1].id;
  const expectedId = `account-${(await digest("amal@example.com")).slice(0, 24)}`;
  assert.equal(id, expectedId);
  await result.store.dispatch(signUp(input));
  assert.equal(result.store.getState().shop.data.customers.length, 2);
  assert.equal(selectAccount(result.store.getState()).customerId, id);
});

test("a session shop-write failure restores persisted auth and retains the old account, cart and admin", async () => {
  const result = await boot();
  await result.store.dispatch(signUp(input));
  await add(result.store);
  result.store.dispatch(setAdmin(true));
  const previous = result.store.getState();
  const savedAuth = result.values.get(AUTH_STORAGE_KEY);
  const savedShop = result.values.get(SHOP_STORAGE_KEY);
  const save = result.storage.setItem;
  let fail = true;
  result.storage.setItem = async (key, value) => {
    if (key === SHOP_STORAGE_KEY && fail) {
      fail = false;
      throw new Error("Session storage unavailable");
    }
    await save(key, value);
  };
  await assert.rejects(
    result.store.dispatch(signOut()),
    /Session storage unavailable/,
  );
  assert.deepEqual(result.store.getState().auth.data, previous.auth.data);
  assert.deepEqual(result.store.getState().shop.data, previous.shop.data);
  assert.equal(result.store.getState().shop.admin, true);
  assert.equal(result.values.get(AUTH_STORAGE_KEY), savedAuth);
  assert.equal(result.values.get(SHOP_STORAGE_KEY), savedShop);
  await result.store.dispatch(signOut());
  assert.equal(selectAccount(result.store.getState()), null);
  assert.equal(result.store.getState().shop.admin, false);
});

test("a failed compensating write reports the failure and a retried account action restores consistency", async () => {
  const result = await boot();
  await result.store.dispatch(signUp(input));
  const previous = result.store.getState().auth.data;
  const save = result.storage.setItem;
  let count = 0;
  result.storage.setItem = async (key, value) => {
    count += 1;
    if (count === 2 || count === 3) throw new Error("Storage unavailable");
    await save(key, value);
  };
  await assert.rejects(
    result.store.dispatch(signOut()),
    /Restoring the saved account also failed/,
  );
  assert.deepEqual(result.store.getState().auth.data, previous);
  assert.match(
    result.store.getState().auth.operationError,
    /Restoring the saved account also failed/,
  );
  await result.store.dispatch(signOut());
  assert.deepEqual(
    JSON.parse(result.values.get(AUTH_STORAGE_KEY)),
    result.store.getState().auth.data,
  );
  assert.deepEqual(
    JSON.parse(result.values.get(SHOP_STORAGE_KEY)),
    result.store.getState().shop.data,
  );
});

test("a failed password reset write preserves the old credential and can be retried", async () => {
  const result = await boot();
  const { recoveryCode } = await result.store.dispatch(signUp(input));
  await result.store.dispatch(signOut());
  const previous = result.store.getState().auth.data;
  const save = result.storage.setItem;
  let fail = true;
  result.storage.setItem = async (key, value) => {
    if (key === AUTH_STORAGE_KEY && fail) {
      fail = false;
      throw new Error("Reset storage unavailable");
    }
    await save(key, value);
  };
  await assert.rejects(
    result.store.dispatch(
      resetPassword(input.email, recoveryCode, "changed-password"),
    ),
    /Reset storage unavailable/,
  );
  assert.deepEqual(result.store.getState().auth.data, previous);
  await result.store.dispatch(signIn(input.email, input.password));
  assert.ok(selectAccount(result.store.getState()));
});

test("interleaved account and checkout transactions reject a stale customer snapshot", async () => {
  const result = await boot();
  await result.store.dispatch(signUp(input));
  await add(result.store);
  const id = selectAccount(result.store.getState()).customerId;
  const entered = deferred();
  const release = deferred();
  const save = result.storage.setItem;
  result.storage.setItem = async (key, value) => {
    if (key === AUTH_STORAGE_KEY) {
      entered.resolve();
      await release.promise;
    }
    await save(key, value);
  };
  const leaving = result.store.dispatch(signOut());
  await entered.promise;
  const checkout = commit(result.store, {
    type: "checkout",
    id: "stale-order",
    createdAt: "2026-11-04T12:00:00.000Z",
    shipping: shipping(id),
    payment: "cash",
  });
  const rejection = assert.rejects(checkout, {
    message: "Your active profile changed. Reopen checkout.",
  });
  release.resolve();
  await Promise.all([leaving, rejection]);
  assert.deepEqual(result.store.getState().shop.data.orders, []);
  assert.equal(
    result.store.getState().shop.data.activeCustomerId,
    "local-customer",
  );
});

test("Redux checkout persists immutable order snapshots after later catalog edits", async () => {
  const result = await boot();
  await add(result.store, 2);
  await commit(result.store, {
    type: "checkout",
    id: "order-1",
    createdAt: "2026-11-04T12:00:00.000Z",
    shipping: shipping("local-customer"),
    payment: "demo-card",
  });
  const order = result.store.getState().shop.data.orders[0];
  result.store.dispatch(setAdmin(true));
  const product = {
    ...result.store.getState().shop.data.products[0],
    price: 999,
    name: "Changed serum",
  };
  await commit(result.store, { type: "save-product", product });
  assert.deepEqual(result.store.getState().shop.data.orders[0], order);
  assert.equal(order.total, 378);
  assert.equal(order.items[0].price, 189);
  const restarted = await boot(Object.fromEntries(result.values));
  assert.deepEqual(restarted.store.getState().shop.data.orders[0], order);
});
