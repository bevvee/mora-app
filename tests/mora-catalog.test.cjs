const assert = require("node:assert/strict");
const test = require("node:test");
const {
  initialStore,
  parseStore,
  validateProduct,
} = require("../src/domain/store.ts");
const {
  upgradeMoraCatalog,
  referenceProducts,
} = require("../src/domain/mora-catalog.ts");
const {
  productPresentation,
} = require("../src/domain/product-presentation.ts");

test("the supplied collection contains 15 distinct reference photos and models across three categories", () => {
  assert.equal(referenceProducts.length, 15);
  assert.equal(new Set(referenceProducts.map((p) => p.image)).size, 15);
  assert.equal(
    new Set(referenceProducts.map((p) => productPresentation(p)?.kind)).size,
    15,
  );
  for (const category of ["Skincare", "Makeup", "Fragrance"])
    assert.equal(
      referenceProducts.filter((p) => p.category === category).length,
      5,
    );
  assert.ok(
    referenceProducts.every((p) => p.demoPrice === true && !validateProduct(p)),
  );
  assert.ok(referenceProducts.some((p) => p.name === "Fleur de Lune"));
});

test("one-time upgrade preserves bags, orders, hidden flags, custom prices, and customer data", () => {
  const original = initialStore();
  original.products[0].price = 227;
  original.products[0].hidden = true;
  original.cart = [{ productId: "serum", quantity: 2 }];
  const previous = structuredClone(original);
  const upgraded = upgradeMoraCatalog(original);
  assert.deepEqual(original, previous);
  assert.equal(upgraded.products.length, 15);
  assert.equal(upgraded.products[0].price, 227);
  assert.equal(upgraded.products[0].demoPrice, false);
  assert.equal(upgraded.products[0].hidden, true);
  assert.deepEqual(upgraded.cart, original.cart);
  assert.deepEqual(upgraded.orders, original.orders);
  assert.deepEqual(upgraded.customers, original.customers);
  assert.deepEqual(parseStore(JSON.stringify(upgraded)), upgraded);
  assert.equal(upgradeMoraCatalog(upgraded), upgraded);
});

test("repurposed seed products stay intact and never get an unrelated model", () => {
  const original = initialStore();
  original.products[0].name = "My custom serum";
  original.products[0].description = "My own description";
  const upgraded = upgradeMoraCatalog(original);
  assert.deepEqual(upgraded.products[0], original.products[0]);
  assert.equal(productPresentation(upgraded.products[0]), undefined);
  assert.equal(
    upgraded.products.find((p) => p.id === "mora-dew-serum").name,
    "Dew Serum",
  );
});

test("a deleted reference is not resurrected after the migration has completed", () => {
  const store = upgradeMoraCatalog(initialStore());
  store.products = store.products.filter((p) => p.id !== "mora-eclat");
  const hydrated = upgradeMoraCatalog(parseStore(JSON.stringify(store)));
  assert.equal(
    hydrated.products.some((p) => p.id === "mora-eclat"),
    false,
  );
});

test("custom photos and occupied reference IDs are retained without duplicate IDs", () => {
  const store = initialStore();
  store.products[0].image = "https://images.unsplash.com/my-custom-photo";
  store.products.push({
    ...store.products[0],
    id: "mora-eclat",
    name: "My existing product",
  });
  const upgraded = upgradeMoraCatalog(store);
  assert.equal(
    upgraded.products.find((p) => p.id === "serum").image,
    store.products[0].image,
  );
  assert.equal(
    upgraded.products.find((p) => p.id === "mora-eclat").name,
    "My existing product",
  );
  assert.equal(
    new Set(upgraded.products.map((p) => p.id)).size,
    upgraded.products.length,
  );
  assert.ok(
    upgraded.products.some(
      (p) => p.name === "Éclat" && productPresentation(p)?.kind === "eclat",
    ),
  );
});


test("reference search handles accents and product types behind the marketing names", () => {
  const {searchProducts}=require("../src/domain/catalog.ts");
  const products=referenceProducts;
  assert.deepEqual(searchProducts(products," ECLAT ").map(p=>p.name),["Éclat"]);
  assert.deepEqual(searchProducts(products,"Rose Ambree").map(p=>p.name),["Rose Ambrée"]);
  assert.deepEqual(searchProducts(products,"lipstick").map(p=>p.name),["Velvet Lip · Rose Nude"]);
  assert.deepEqual(searchProducts(products,"foundation").map(p=>p.name),["Skin Silk"]);
  assert.equal(searchProducts(products,"parfum").length,5);
  assert.equal(searchProducts(products.map(p=>({...p,hidden:true})),"parfum").length,0);
});
