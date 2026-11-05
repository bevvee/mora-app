const assert = require("node:assert/strict");
const test = require("node:test");
const { initialStore } = require("../src/domain/store.ts");
const {
  categoryDefinitions,
  categoryProducts,
  getCategories,
  getSubcategories,
  productSubcategory,
  searchProducts,
} = require("../src/domain/catalog.ts");

test("product-name search trims input, ignores case, and excludes hidden products", () => {
  const products = initialStore().products;
  assert.deepEqual(
    searchProducts(products, "  SERUM  ").map((product) => product.id),
    ["serum"],
  );
  assert.deepEqual(
    searchProducts(
      products.map((product) => ({
        ...product,
        hidden: product.id === "serum",
      })),
      "serum",
    ),
    [],
  );
  assert.deepEqual(searchProducts(products, "unavailable product"), []);
});

test("category and subcategory selections produce only matching visible products", () => {
  const products = initialStore().products;
  assert.deepEqual(
    categoryProducts(products, "Skincare").map((product) => product.id),
    ["serum", "cream"],
  );
  assert.deepEqual(
    categoryProducts(products, "Skincare", "Serums").map(
      (product) => product.id,
    ),
    ["serum"],
  );
  assert.deepEqual(categoryProducts(products, "Makeup", "Serums"), []);
  assert.deepEqual(
    categoryProducts(
      products.map((product) => ({ ...product, hidden: true })),
      "Skincare",
    ),
    [],
  );
  assert.deepEqual(categoryProducts(products, "Missing category"), []);
});

test("previously saved seed products retain their subcategory while custom products have a fallback", () => {
  const serum = initialStore().products[0];
  assert.equal(
    productSubcategory({ ...serum, subcategory: undefined }),
    "Serums",
  );
  assert.equal(
    productSubcategory({ ...serum, id: "custom", subcategory: undefined }),
    "Other",
  );
  assert.equal(
    productSubcategory({
      ...serum,
      category: "Makeup",
      subcategory: undefined,
    }),
    "Other",
  );
  assert.equal(
    productSubcategory({ ...serum, subcategory: "  Face oils  " }),
    "Face oils",
  );
});

test("category browsing includes visible custom groups and deduplicates subcategories", () => {
  const seed = initialStore().products[0];
  const products = [
    { ...seed, id: "custom-a", category: "Hair care", subcategory: "Shampoo" },
    { ...seed, id: "custom-b", category: "Hair care", subcategory: "Shampoo" },
    { ...seed, id: "hidden", category: "Hidden collection", hidden: true },
  ];
  const names = getCategories(products).map((category) => category.name);
  assert.ok(
    categoryDefinitions.every((category) => names.includes(category.name)),
  );
  assert.ok(names.includes("Hair care"));
  assert.ok(!names.includes("Hidden collection"));
  assert.deepEqual(getSubcategories("Hair care", products), ["Shampoo"]);
});
