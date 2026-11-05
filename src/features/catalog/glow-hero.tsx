import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import Sparkles from "lucide-react-native/icons/sparkles";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import type { Product } from "../../domain/store";
import { productPresentation } from "../../domain/product-presentation";
import { Button, colors, ui } from "../../components/shop/ui";
import { ProductStage } from "../../components/three/product-stage";

export function GlowHero({
  product,
  companion,
  visible,
  onExplore,
}: {
  product?: Product;
  companion?: Product;
  visible: boolean;
  onExplore: () => void;
}) {
  const wide = useWindowDimensions().width >= 700;
  return (
    <View style={styles.hero}>
      <View style={[styles.main, wide && { flexDirection: "row" }]}>
        <View style={[styles.copy, wide && { flex: 1 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles
              size={15}
              color={colors.accent}
              strokeWidth={1.5}
              aria-hidden={true}
            />
            <Text style={ui.eyebrow}>THE GLOW EDIT</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            A little care.{"\n"}A lot of glow.
          </Text>
          <Text style={[ui.body, { maxWidth: 260 }]}>
            Make a little room for yourself. Discover beauty for your everyday
            ritual.
          </Text>
          <View style={{ alignSelf: "flex-start", marginTop: 4 }}>
            <Button
              title="Find your essentials"
              icon={ArrowUpRight}
              onPress={onExplore}
            />
          </View>
        </View>
        {product && productPresentation(product) && (
          <View style={[styles.art, wide && { flex: 1 }]}>
            <ProductStage
              product={product}
              companion={
                companion ? productPresentation(companion)?.kind : undefined
              }
              collection
              visible={visible}
            />
            <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
              <Button
                secondary
                title={`Meet ${product.name}`}
                icon={ArrowUpRight}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: product.id },
                  })
                }
              />
            </View>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          YOUR RITUAL. YOUR PACE. YOUR MORA.
        </Text>
        <View style={styles.dot} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    backgroundColor: "#EDE0D2",
    borderWidth: 1,
    borderColor: "#E5D5C3",
    overflow: "hidden",
  },
  main: { gap: 0 },
  copy: { gap: 16, padding: 26, paddingBottom: 20, justifyContent: "center" },
  title: {
    color: colors.ink,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.7,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia, serif",
    }),
  },
  art: { minWidth: 0, justifyContent: "center" },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#DCCAB7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  footerText: {
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 1.5,
    fontWeight: "600",
    flexShrink: 1,
  },
  dot: { width: 6, height: 6, backgroundColor: colors.accent, borderRadius: 3 },
});
