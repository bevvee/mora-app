import Box from "lucide-react-native/icons/box";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Product } from "../../domain/store";
import {
  productPresentation,
  type ModelKind,
} from "../../domain/product-presentation";
import { useSceneActivity } from "../../hooks/use-scene-activity";
import { IconButton } from "../shop/app-header";
import { colors, ProductImage, ui } from "../shop/ui";
import { SceneBoundary } from "./scene-boundary";

const ProductScene = lazy(() => import("./product-scene"));

export function ProductStage({
  product,
  companion,
  collection = false,
  visible = true,
}: {
  product: Product;
  companion?: ModelKind;
  collection?: boolean;
  visible?: boolean;
}) {
  const presentation = productPresentation(product);
  const { active, reducedMotion } = useSceneActivity();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback((value: boolean) => setReady(value), []);
  const dragStart = useRef(0);
  const currentAngle = useRef(angle);
  useEffect(() => {
    currentAngle.current = angle;
  }, [angle]);
  const onGrant = useCallback(() => {
    dragStart.current = currentAngle.current;
    setSpinning(false);
  }, []);
  const onMove = useCallback(
    (_: unknown, gesture: { dx: number }) =>
      setAngle(dragStart.current + gesture.dx / 90),
    [],
  );
  // PanResponder stores these handlers; it reads refs only when gestures fire.
  const pan = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !collection &&
          Math.abs(gesture.dx) > 8 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderGrant: onGrant,
        onPanResponderMove: onMove,
      }),
    [collection, onGrant, onMove],
  );

  if (!presentation)
    return <ProductImage uri={product.image} label={product.name} large />;
  const fallback = (
    <View style={{ gap: 10 }}>
      <ProductImage uri={product.image} label={product.name} large />
      <Text
        accessibilityLiveRegion="polite"
        style={[ui.body, { textAlign: "center", fontSize: 13 }]}
      >
        The 3D preview is unavailable here. Enjoy the product photo instead.
      </Text>
    </View>
  );

  return (
    <SceneBoundary key={`${product.id}-${product.image}`} fallback={fallback}>
      <View
        style={[styles.stage, { backgroundColor: presentation.background }]}
      >
        <View style={styles.badge} pointerEvents="none">
          <Box
            size={13}
            strokeWidth={1.6}
            color={colors.accent}
            aria-hidden={true}
          />
          <Text style={styles.badgeText}>
            {collection ? "A LITTLE EVERYDAY LUXURY" : "3D STUDIO"}
          </Text>
        </View>
        <View
          style={{ height: collection ? 260 : 300 }}
          testID={`mora-scene-${presentation.kind}-${ready ? "ready" : "loading"}`}
          accessibilityState={{ busy: !ready }}
          {...pan.panHandlers}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Stylized 3D ${product.name}${collection ? " collection" : ". Use the controls below to rotate the packaging"}`}
        >
          {active && visible && (
            <Suspense fallback={null}>
              <ProductScene
                key={revision}
                kind={presentation.kind}
                companion={companion}
                animated={spinning && !reducedMotion}
                angle={angle}
                collection={collection}
                onReady={onReady}
              />
            </Suspense>
          )}
          {!ready && active && visible && (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, ui.center]}
            >
              <ActivityIndicator color={colors.accent} />
              <Text style={ui.body}>Opening the studio…</Text>
            </View>
          )}
        </View>
        {!collection && (
          <View style={styles.controls}>
            <IconButton
              icon={ChevronLeft}
              label="Rotate product left"
              onPress={() => {
                setSpinning(false);
                setAngle((value) => value - Math.PI / 4);
              }}
            />
            {!reducedMotion && (
              <IconButton
                icon={spinning ? Pause : Play}
                label={
                  spinning ? "Pause product rotation" : "Start product rotation"
                }
                onPress={() => setSpinning((value) => !value)}
              />
            )}
            <IconButton
              icon={RotateCcw}
              label="Reset product view"
              onPress={() => {
                setAngle(0);
                setSpinning(false);
                setRevision((value) => value + 1);
              }}
            />
            <IconButton
              icon={ChevronRight}
              label="Rotate product right"
              onPress={() => {
                setSpinning(false);
                setAngle((value) => value + Math.PI / 4);
              }}
            />
          </View>
        )}
        {!collection && (
          <Text style={styles.hint}>
            Drag sideways or use the arrows to explore
          </Text>
        )}
      </View>
    </SceneBoundary>
  );
}

const styles = StyleSheet.create({
  stage: {
    borderRadius: 24,
    overflow: "hidden",
    paddingTop: 16,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
    backgroundColor: "#FCFAF7BB",
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: colors.accent,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    paddingTop: 12,
    paddingHorizontal: 12,
  },
});
