const assert = require("node:assert/strict");
const test = require("node:test");
const { referenceProducts } = require("../src/domain/mora-catalog.ts");
const {
  productPresentation,
} = require("../src/domain/product-presentation.ts");

test("every actual reference has a model and the capacity shown on its packaging", () => {
  for (const product of referenceProducts) {
    const presentation = productPresentation(product);
    assert.ok(presentation?.kind);
    assert.match(
      presentation.volume,
      /^(120 ml|150 ml|50 ml|30 ml|3\.5 g|10 ml|8 ml|5 ml|75 ml)$/,
    );
  }
});
test("only an explicitly registered reference image receives its corresponding model", () => {
  const serum = referenceProducts[0];
  assert.equal(
    productPresentation({ ...serum, id: "my-custom-id" })?.kind,
    "dew-serum",
  );
  assert.equal(
    productPresentation({
      ...serum,
      image: "https://example.com/custom-serum.png",
    }),
    undefined,
  );
  assert.equal(
    productPresentation({ ...serum, category: "Makeup" }),
    undefined,
  );
  assert.equal(
    productPresentation({ ...serum, image: "mora-asset:constructor" }),
    undefined,
  );
});
