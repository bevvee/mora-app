import type { Product, Store } from "./store";

export const MORA_CATALOG_REVISION = 2;
export const referenceProducts: Product[] = [
  {
    id: "serum",
    name: "Dew Serum",
    category: "Skincare",
    subcategory: "Serums",
    price: 189,
    demoPrice: true,
    description:
      "An ivory serum bottle with a chocolate dropper, made for your daily ritual.",
    image: "mora-asset:dew-serum",
    hidden: false,
  },
  {
    id: "lipstick",
    name: "Velvet Lip · Rose Nude",
    category: "Makeup",
    subcategory: "Lips",
    price: 99,
    demoPrice: true,
    description: "A rose nude lipstick in the signature chocolate MORA case.",
    image: "mora-asset:velvet-lip",
    hidden: false,
  },
  {
    id: "cream",
    name: "Cloud Cream",
    category: "Skincare",
    subcategory: "Moisturizers",
    price: 149,
    demoPrice: true,
    description:
      "The MORA daily moisturizer in an ivory jar with a chocolate lid.",
    image: "mora-asset:cloud-cream",
    hidden: false,
  },
  {
    id: "perfume",
    name: "Vanille Douce",
    category: "Fragrance",
    subcategory: "Eau de parfum",
    price: 299,
    demoPrice: true,
    description:
      "Eau de parfum in an amber glass bottle with a polished chocolate pebble cap.",
    image: "mora-asset:vanille-douce",
    hidden: false,
  },
  {
    id: "mora-petal-toner",
    name: "Petal Toner",
    category: "Skincare",
    subcategory: "Toners",
    price: 139,
    demoPrice: true,
    description:
      "Rose toner in a clear pink bottle with a rounded chocolate cap.",
    image: "mora-asset:petal-toner",
    hidden: false,
  },
  {
    id: "mora-silk-cleanser",
    name: "Silk Cleanser",
    category: "Skincare",
    subcategory: "Cleansers",
    price: 129,
    demoPrice: true,
    description:
      "A gentle cleanser presented in a tall ivory bottle with a chocolate pump.",
    image: "mora-asset:silk-cleanser",
    hidden: false,
  },
  {
    id: "mora-sun-veil",
    name: "Sun Veil",
    category: "Skincare",
    subcategory: "Sun care",
    price: 169,
    demoPrice: true,
    description:
      "The MORA daily sunscreen in an ivory tube with soft rose waves and a chocolate flip cap.",
    image: "mora-asset:sun-veil",
    hidden: false,
  },
  {
    id: "mora-rose-tint",
    name: "Rose Tint",
    category: "Makeup",
    subcategory: "Face",
    price: 129,
    demoPrice: true,
    description:
      "A liquid blush in a soft rose bottle with a domed chocolate cap.",
    image: "mora-asset:rose-tint",
    hidden: false,
  },
  {
    id: "mora-lash-muse",
    name: "Lash Muse",
    category: "Makeup",
    subcategory: "Eyes",
    price: 119,
    demoPrice: true,
    description:
      "Volume mascara in a sculpted chocolate tube with ivory lettering.",
    image: "mora-asset:lash-muse",
    hidden: false,
  },
  {
    id: "mora-honey-gloss",
    name: "Honey Gloss",
    category: "Makeup",
    subcategory: "Lips",
    price: 109,
    demoPrice: true,
    description:
      "A nude peach lip gloss in a clear tube with a polished chocolate cap.",
    image: "mora-asset:honey-gloss",
    hidden: false,
  },
  {
    id: "mora-skin-silk",
    name: "Skin Silk",
    category: "Makeup",
    subcategory: "Face",
    price: 219,
    demoPrice: true,
    description:
      "Serum foundation in a frosted rounded bottle with an ivory pump.",
    image: "mora-asset:skin-silk",
    hidden: false,
  },
  {
    id: "mora-bois-de-soie",
    name: "Bois de Soie",
    category: "Fragrance",
    subcategory: "Eau de parfum",
    price: 349,
    demoPrice: true,
    description:
      "Eau de parfum in a rounded amber glass flask with an ivory sculptural cap.",
    image: "mora-asset:bois-de-soie",
    hidden: false,
  },
  {
    id: "mora-fleur-de-lune",
    name: "Fleur de Lune",
    category: "Fragrance",
    subcategory: "Eau de parfum",
    price: 319,
    demoPrice: true,
    description:
      "Eau de parfum in an oval glass bottle with a chocolate pebble cap.",
    image: "mora-asset:fleur-de-lune",
    hidden: false,
  },
  {
    id: "mora-eclat",
    name: "Éclat",
    category: "Fragrance",
    subcategory: "Eau de parfum",
    price: 329,
    demoPrice: true,
    description:
      "Eau de parfum in a softly rounded glass flask with a sculptural chocolate cap.",
    image: "mora-asset:eclat",
    hidden: false,
  },
  {
    id: "mora-rose-ambree",
    name: "Rose Ambrée",
    category: "Fragrance",
    subcategory: "Eau de parfum",
    price: 339,
    demoPrice: true,
    description:
      "Eau de parfum in a faceted rose glass bottle with a spherical chocolate cap.",
    image: "mora-asset:rose-ambree",
    hidden: false,
  },
];

const legacyNames: Record<string, string> = {
  serum: "Glow Face Serum",
  lipstick: "Soft Rose Lipstick",
  cream: "Daily Hydrating Cream",
  perfume: "Signature Eau de Parfum",
};

const legacyDescriptions: Record<string, string> = {
  serum:
    "A lightweight serum for your daily glow ritual. Apply a few drops to clean skin before your moisturizer.",
  lipstick:
    "A soft rose shade with a creamy finish. An effortless touch of color for every day.",
  cream:
    "Make time for a little care. Massage gently into clean skin as part of your morning or evening routine.",
  perfume:
    "Your everyday signature. A beautifully balanced fragrance to finish your personal ritual.",
};

const legacyImages: Record<string, string> = {
  serum:
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700&auto=format&fit=crop&q=85",
  lipstick:
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700&auto=format&fit=crop&q=85",
  cream:
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700&auto=format&fit=crop&q=85",
  perfume:
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop&q=85",
};

// Upgrade the untouched sample catalog once. Preserve IDs, bag quantities,
// historical order snapshots, hidden flags, custom prices, and custom products.
export function upgradeMoraCatalog(store: Store): Store {
  if ((store.catalogRevision ?? 0) >= MORA_CATALOG_REVISION) return store;
  const existing = new Set(store.products.map((product) => product.id));
  const products = store.products.map((product) => {
    const replacement = referenceProducts.find(
      (entry) => entry.id === product.id,
    );
    if (
      !replacement ||
      product.category !== replacement.category ||
      product.name !== legacyNames[product.id] ||
      product.image !== legacyImages[product.id]
    )
      return product;
    return {
      ...replacement,
      description:
        product.description === legacyDescriptions[product.id]
          ? replacement.description
          : product.description,
      subcategory:
        product.subcategory && product.subcategory !== replacement.subcategory
          ? product.subcategory
          : replacement.subcategory,
      price: product.price,
      hidden: product.hidden,
      demoPrice: product.price === replacement.price,
    };
  });
  // If a seed ID has been repurposed by an administrator, retain it and add the
  // reference under its own stable ID. It never inherits an unrelated 3D model.
  for (const product of referenceProducts) {
    if (
      products.some(
        (entry) =>
          entry.image === product.image && entry.category === product.category,
      )
    )
      continue;
    let id = product.id;
    if (existing.has(id)) {
      const base = `mora-${product.image.slice("mora-asset:".length)}`;
      id = base;
      let suffix = 2;
      while (existing.has(id)) id = `${base}-${suffix++}`;
    }
    products.push({ ...product, id });
    existing.add(id);
  }
  return { ...store, products, catalogRevision: MORA_CATALOG_REVISION };
}
