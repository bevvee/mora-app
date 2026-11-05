import type { Product } from "./store";

export type ModelKind =
  | "petal-toner"
  | "silk-cleanser"
  | "cloud-cream"
  | "dew-serum"
  | "sun-veil"
  | "velvet-lip"
  | "rose-tint"
  | "lash-muse"
  | "honey-gloss"
  | "skin-silk"
  | "vanille-douce"
  | "bois-de-soie"
  | "fleur-de-lune"
  | "eclat"
  | "rose-ambree";
export type ProductPresentation = {
  kind: ModelKind;
  background: string;
  note: string;
  volume: string;
};
const profiles: Record<
  ModelKind,
  { category: string; volume: string; note: string }
> = {
  "petal-toner": {
    category: "Skincare",
    volume: "120 ml",
    note: "A petal-soft start to your ritual.",
  },
  "silk-cleanser": {
    category: "Skincare",
    volume: "150 ml",
    note: "A quiet moment, a fresh start.",
  },
  "cloud-cream": {
    category: "Skincare",
    volume: "50 ml",
    note: "A little comfort, every day.",
  },
  "dew-serum": {
    category: "Skincare",
    volume: "30 ml",
    note: "A few drops. A moment for you.",
  },
  "sun-veil": {
    category: "Skincare",
    volume: "50 ml",
    note: "Your everyday Sun Veil.",
  },
  "velvet-lip": {
    category: "Makeup",
    volume: "3.5 g",
    note: "Your everyday touch of rose nude.",
  },
  "rose-tint": {
    category: "Makeup",
    volume: "10 ml",
    note: "A little rose, your way.",
  },
  "lash-muse": {
    category: "Makeup",
    volume: "8 ml",
    note: "A chocolate essential for your makeup ritual.",
  },
  "honey-gloss": {
    category: "Makeup",
    volume: "5 ml",
    note: "A little shine in honey nude.",
  },
  "skin-silk": {
    category: "Makeup",
    volume: "30 ml",
    note: "Meet your Skin Silk ritual.",
  },
  "vanille-douce": {
    category: "Fragrance",
    volume: "50 ml",
    note: "The warmth of Vanille Douce.",
  },
  "bois-de-soie": {
    category: "Fragrance",
    volume: "75 ml",
    note: "The sculptural signature of Bois de Soie.",
  },
  "fleur-de-lune": {
    category: "Fragrance",
    volume: "50 ml",
    note: "A little Fleur de Lune.",
  },
  eclat: {
    category: "Fragrance",
    volume: "50 ml",
    note: "Your moment of Éclat.",
  },
  "rose-ambree": {
    category: "Fragrance",
    volume: "50 ml",
    note: "The finishing touch: Rose Ambrée.",
  },
};
export function productPresentation(
  product: Product,
): ProductPresentation | undefined {
  if (!product.image.startsWith("mora-asset:")) return undefined;
  const key = product.image.slice("mora-asset:".length);
  if (!Object.hasOwn(profiles, key)) return undefined;
  const kind = key as ModelKind;
  const profile = profiles[kind];
  if (profile.category !== product.category) return undefined;
  return {
    kind,
    volume: profile.volume,
    note: profile.note,
    background:
      profile.category === "Makeup"
        ? "#F1E2DB"
        : profile.category === "Fragrance"
          ? "#EDE1D2"
          : "#EEE5D8",
  };
}
