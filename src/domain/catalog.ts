import type { Product } from "./store";

export type CategoryDefinition = {
  name: string;
  description: string;
  subcategories: string[];
};

export const categoryDefinitions: CategoryDefinition[] = [
  {
    name: "Skincare",
    description:
      "Care for your skin, from the first cleanse to the final glow.",
    subcategories: ["Cleansers", "Toners", "Serums", "Moisturizers", "Sun care"],
  },
  {
    name: "Makeup",
    description: "A little color for every mood and every day.",
    subcategories: ["Face", "Eyes", "Lips"],
  },
  {
    name: "Fragrance",
    description: "Find a scent that feels like you.",
    subcategories: ["Eau de parfum", "Eau de toilette", "Body mists"],
  },
];

const seedSubcategories: Record<string, { category: string; name: string }> = {
  serum: { category: "Skincare", name: "Serums" },
  cream: { category: "Skincare", name: "Moisturizers" },
  lipstick: { category: "Makeup", name: "Lips" },
  perfume: { category: "Fragrance", name: "Eau de parfum" },
};

export function productSubcategory(product: Product): string {
  if (product.subcategory?.trim()) return product.subcategory.trim();
  // Saved catalogs from before subcategories were added keep their seed groups.
  const seed = seedSubcategories[product.id];
  return seed?.category === product.category ? seed.name : "Other";
}

export function getSubcategories(
  category: string,
  products: Product[],
): string[] {
  const predefined = categoryDefinitions.find((item) => item.name === category);
  return [
    ...new Set([
      ...(predefined?.subcategories ?? []),
      ...products
        .filter((product) => product.category === category)
        .map(productSubcategory),
    ]),
  ];
}

export function getCategories(products: Product[]): CategoryDefinition[] {
  const customNames = new Set(
    products
      .filter((product) => !product.hidden)
      .map((product) => product.category)
      .filter(
        (name) => !categoryDefinitions.some((item) => item.name === name),
      ),
  );
  return [
    ...categoryDefinitions,
    ...Array.from(customNames, (name) => ({
      name,
      description: "Discover more essentials for your everyday ritual.",
      subcategories: getSubcategories(
        name,
        products.filter((p) => !p.hidden),
      ),
    })),
  ];
}

export function searchProducts(products: Product[], query: string): Product[] {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const term = normalize(query.trim());
  return products.filter(
    (product) => !product.hidden && normalize([product.name, product.category, product.subcategory ?? "", product.description].join(" ")).includes(term),
  );
}

export function categoryProducts(
  products: Product[],
  category?: string,
  subcategory?: string,
): Product[] {
  return products.filter(
    (product) =>
      !product.hidden &&
      (!category || product.category === category) &&
      (!subcategory || productSubcategory(product) === subcategory),
  );
}
