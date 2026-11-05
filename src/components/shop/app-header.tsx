import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "./theme";
import { GlassButtonSurface } from "./glass-button-surface";

export function IconButton({
  icon: Icon,
  label,
  onPress,
  disabled = false,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.iconButton}
    >
      {({ pressed }) => (
        <>
          <GlassButtonSurface disabled={disabled} />
          {/* Keep the glass and its parents fully opaque; dim only foregrounds. */}
          <View
            pointerEvents="none"
            style={{ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }}
          >
            <Icon
              size={22}
              strokeWidth={1.8}
              color={colors.ink}
              accessible={false}
            />
          </View>
          {!!badge && (
            <View
              pointerEvents="none"
              style={[
                styles.badge,
                { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

export function AppHeader({
  title,
  caption,
  back = false,
  brand = false,
  actions,
}: {
  title: string;
  caption?: string;
  back?: boolean;
  brand?: boolean;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.inner}>
        {back && (
          <IconButton
            icon={ArrowLeft}
            label="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/home")
            }
          />
        )}
        <View style={styles.titles}>
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            style={[styles.title, brand && styles.brand]}
          >
            {title}
          </Text>
          {caption && (
            <Text style={styles.caption} numberOfLines={1}>
              {caption}
            </Text>
          )}
        </View>
        {actions}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  inner: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
  titles: { flex: 1, gap: 4 },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  brand: { fontSize: 36, letterSpacing: -2, lineHeight: 39 },
  caption: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "600",
  },
  iconButton: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -4,
    minWidth: 20,
    minHeight: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: colors.white },
});
