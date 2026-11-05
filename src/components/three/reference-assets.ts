import { Asset } from "expo-asset";

export const referenceAssets: Record<string, number> = {
  "dew-serum": require("../../../assets/products/dew-serum.png"),
  "velvet-lip": require("../../../assets/products/velvet-lip.png"),
  "cloud-cream": require("../../../assets/products/cloud-cream.png"),
  "vanille-douce": require("../../../assets/products/vanille-douce.png"),
  "petal-toner": require("../../../assets/products/petal-toner.png"),
  "silk-cleanser": require("../../../assets/products/silk-cleanser.png"),
  "sun-veil": require("../../../assets/products/sun-veil.png"),
  "rose-tint": require("../../../assets/products/rose-tint.png"),
  "lash-muse": require("../../../assets/products/lash-muse.png"),
  "honey-gloss": require("../../../assets/products/honey-gloss.png"),
  "skin-silk": require("../../../assets/products/skin-silk.png"),
  "bois-de-soie": require("../../../assets/products/bois-de-soie.png"),
  "fleur-de-lune": require("../../../assets/products/fleur-de-lune.png"),
  eclat: require("../../../assets/products/eclat.png"),
  "rose-ambree": require("../../../assets/products/rose-ambree.png"),
};

export function productImageUri(image: string): string {
  if (!image.startsWith("mora-asset:")) return image;
  const key = image.slice("mora-asset:".length);
  return Object.hasOwn(referenceAssets, key)
    ? Asset.fromModule(referenceAssets[key]).uri
    : "";
}
