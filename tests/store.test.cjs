const assert = require("node:assert/strict");
const test = require("node:test");
const {
  cartDetails,
  cartTotal,
  initialStore,
  parseStore,
  updateStore,
  validateCustomer,
} = require("../src/domain/store.ts");

const createdAt = "2026-11-04T12:00:00.000Z";
const customer = (id = "local-customer", fields = {}) => ({
  id,
  name: "Amal Idrissi",
  email: `${id}@example.com`,
  phone: "+212 612 345 678",
  address: "12 Rue des Fleurs",
  city: "Casablanca",
  ...fields,
});
const add = (store, productId = "serum", amount = 1) =>
  updateStore(store, { type: "cart", productId, amount });
const checkout = (store, fields = {}) =>
  updateStore(store, {
    type: "checkout",
    id: "order-1",
    createdAt,
    shipping: customer(store.activeCustomerId),
    payment: "demo-card",
    ...fields,
  });

test("bag quantities combine, respect the limit, and remove items at zero", () => {
  const original = initialStore();
  let store = add(original, "serum", 2);
  store = add(store, "serum", 3);
  store = add(store, "lipstick", 1);
  assert.equal(
    store.cart.find((line) => line.productId === "serum").quantity,
    5,
  );
  assert.equal(cartTotal(store), 189 * 5 + 99);
  assert.equal(cartDetails(store).length, 2);
  assert.deepEqual(original.cart, []);

  for (const amount of [95, 0.5, NaN]) {
    assert.throws(() => add(store, "serum", amount), /up to 99/);
  }
  store = add(store, "serum", -5);
  assert.deepEqual(store.cart, [{ productId: "lipstick", quantity: 1 }]);
  store = add(store, "lipstick", -2);
  assert.deepEqual(store.cart, []);
});

test("hiding or deleting a product removes it from the bag", () => {
  for (const action of ["hide", "delete"]) {
    let store = add(add(initialStore()), "lipstick");
    const serum = store.products.find((product) => product.id === "serum");
    store =
      action === "hide"
        ? updateStore(store, {
            type: "save-product",
            product: { ...serum, hidden: true },
          })
        : updateStore(store, { type: "delete-product", id: "serum" });
    assert.deepEqual(store.cart, [{ productId: "lipstick", quantity: 1 }]);
    assert.equal(cartTotal(store), 99);
    assert.throws(() => add(store), /no longer available/);
  }
  assert.throws(() => add(initialStore(), "missing"), /no longer available/);
});

test("checkout rejects an empty or stale bag without changing the store", () => {
  const empty = initialStore();
  assert.throws(() => checkout(empty), /cart changed/);
  for (const productId of ["missing", "serum"]) {
    const stale = { ...initialStore(), cart: [{ productId, quantity: 1 }] };
    if (productId === "serum") stale.products[0].hidden = true;
    assert.throws(() => checkout(stale), /cart changed/);
    assert.equal(stale.orders.length, 0);
    assert.equal(stale.cart.length, 1);
  }
});

test("checkout requires complete valid shipping details", () => {
  const store = add(initialStore());
  for (const [fields, error] of [
    [{ name: " " }, /full name/],
    [{ email: "invalid" }, /email address/],
    [{ phone: "" }, /phone number/],
    [{ address: "" }, /delivery address/],
    [{ city: " " }, /delivery address/],
  ]) {
    const shipping = customer(store.activeCustomerId, fields);
    assert.match(validateCustomer(shipping), error);
    assert.throws(() => checkout(store, { shipping }), error);
  }
  assert.equal(store.orders.length, 0);
  assert.equal(store.cart.length, 1);
});

test("checkout rejects another profile, invalid payment, and duplicate order IDs", () => {
  const store = add(initialStore());
  assert.throws(
    () => checkout(store, { shipping: customer("other") }),
    /active profile changed/,
  );
  assert.throws(
    () => checkout(store, { payment: "unknown" }),
    /payment method/,
  );
  const placed = checkout(store);
  assert.throws(() => checkout(add(placed)), /already been placed/);
  assert.equal(placed.orders.length, 1);
  assert.deepEqual(placed.cart, []);
});

test("orders snapshot item names, prices, quantities, total, and shipping", () => {
  let store = add(add(initialStore(), "serum", 2), "lipstick");
  const shipping = customer();
  store = checkout(store, { shipping, payment: "cash" });
  const order = structuredClone(store.orders[0]);
  assert.equal(order.total, 477);
  assert.equal(order.status, "Payment on delivery");
  assert.deepEqual(order.items, [
    { productId: "serum", name: "Glow Face Serum", price: 189, quantity: 2 },
    {
      productId: "lipstick",
      name: "Soft Rose Lipstick",
      price: 99,
      quantity: 1,
    },
  ]);
  shipping.address = "A later address";
  store = updateStore(store, {
    type: "save-product",
    product: {
      ...store.products.find((product) => product.id === "serum"),
      name: "New Serum",
      price: 10,
    },
  });
  store = updateStore(store, { type: "delete-product", id: "lipstick" });
  store = updateStore(store, {
    type: "save-customer",
    customer: customer(undefined, { city: "Rabat" }),
  });
  assert.deepEqual(store.orders[0], order);
});

test("switching profiles clears the bag and keeps order history assigned to each customer", () => {
  let store = checkout(add(initialStore()));
  const second = customer("second");
  store = updateStore(store, { type: "register-customer", customer: second });
  store = add(store, "cream");
  store = updateStore(store, { type: "switch-customer", id: second.id });
  assert.deepEqual(store.cart, []);
  assert.equal(store.activeCustomerId, "second");
  store = checkout(add(store, "lipstick"), { id: "order-2", shipping: second });
  assert.deepEqual(
    store.orders
      .filter((order) => order.customerId === "local-customer")
      .map((order) => order.id),
    ["order-1"],
  );
  assert.deepEqual(
    store.orders
      .filter((order) => order.customerId === "second")
      .map((order) => order.id),
    ["order-2"],
  );
  store = updateStore(add(store), {
    type: "switch-customer",
    id: "local-customer",
  });
  assert.deepEqual(store.cart, []);
  assert.equal(store.orders.length, 2);
  assert.throws(
    () => updateStore(store, { type: "switch-customer", id: "missing" }),
    /Customer not found/,
  );
});

test("registration accepts a name and email before delivery information is entered", () => {
  const partial = customer("new", {
    name: "  Amal  ",
    email: "  AMAL@EXAMPLE.COM  ",
    phone: "",
    address: "",
    city: "",
  });
  const original = initialStore();
  let store = updateStore(original, {
    type: "register-customer",
    customer: partial,
  });
  const saved = store.customers.find((profile) => profile.id === "new");
  assert.deepEqual(saved, {
    ...partial,
    name: "Amal",
    email: "amal@example.com",
  });
  assert.equal(original.customers.length, 1);
  assert.equal(store.activeCustomerId, original.activeCustomerId);
  store = updateStore(store, {
    type: "save-customer",
    customer: { ...saved, name: " Amal Edited " },
  });
  assert.equal(
    store.customers.find((profile) => profile.id === "new").name,
    "Amal Edited",
  );
  assert.match(validateCustomer(saved), /phone number/);
});

test("registration rejects invalid identity and duplicate IDs or normalized emails", () => {
  const register = (store, profile) =>
    updateStore(store, { type: "register-customer", customer: profile });
  const store = register(initialStore(), customer("new"));
  assert.throws(
    () => register(store, customer("new", { email: "different@example.com" })),
    /ID already exists/,
  );
  assert.throws(
    () => register(store, customer("another", { email: " NEW@EXAMPLE.COM " })),
    /email already exists/,
  );
  assert.throws(
    () => register(store, customer("invalid", { name: " " })),
    /full name/,
  );
  assert.throws(
    () => register(store, customer("invalid", { email: "no-domain" })),
    /email address/,
  );
  assert.equal(store.customers.length, 2);
});

test("stored state roundtrips with partial profiles, a bag, and historical deleted products", () => {
  let store = checkout(add(initialStore()));
  store = updateStore(store, { type: "delete-product", id: "serum" });
  store = updateStore(store, {
    type: "register-customer",
    customer: customer("partial", { phone: "", address: "", city: "" }),
  });
  store = add(store, "cream", 2);
  assert.deepEqual(parseStore(JSON.stringify(store)), store);
});

test("stored state rejects malformed data rather than returning a replacement", () => {
  assert.throws(() => parseStore("{broken"), SyntaxError);
  for (const mutate of [
    (store) => {
      store.version = 2;
    },
    (store) => {
      store.activeCustomerId = "missing";
    },
    (store) => {
      store.products[0].price = -1;
    },
    (store) => {
      store.products[0].hidden = "false";
    },
    (store) => {
      delete store.customers[0].address;
    },
    (store) => {
      store.cart = [{ productId: "serum", quantity: 0 }];
    },
    (store) => {
      store.cart = [{ productId: "serum", quantity: 1.5 }];
    },
    (store) => {
      store.cart = [{ productId: "serum", quantity: 100 }];
    },
    (store) => {
      store.orders[0].createdAt = "invalid";
    },
    (store) => {
      store.orders[0].payment = "unknown";
    },
    (store) => {
      store.orders[0].items = [];
    },
    (store) => {
      store.orders[0].items[0].quantity = -1;
    },
  ]) {
    const malformed = checkout(add(initialStore()));
    mutate(malformed);
    assert.throws(
      () => parseStore(JSON.stringify(malformed)),
      /Saved data could not be read/,
    );
  }
  for (const raw of ["null", "[]", "{}"]) {
    assert.throws(() => parseStore(raw), /Saved data could not be read/);
  }
});
