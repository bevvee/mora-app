import { NativeTabs } from "expo-router/native-tabs";
import { DynamicColorIOS } from "react-native";
import { cartDetails } from "../../domain/store";
import { useStore } from "../../state/store-provider";
import { colors } from "../shop/theme";

const iconColor = DynamicColorIOS({ light: colors.muted, dark: colors.soft });
const selectedColor = DynamicColorIOS({
  light: colors.accent,
  dark: colors.background,
});
const contentStyle = { backgroundColor: colors.background };

export default function ShopTabs() {
  const { store } = useStore();
  const count = cartDetails(store).reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  return (
    <NativeTabs
      tintColor={selectedColor}
      iconColor={{ default: iconColor, selected: selectedColor }}
      labelStyle={{
        default: { color: iconColor, fontSize: 12 },
        selected: { color: selectedColor, fontSize: 12 },
      }}
      badgeBackgroundColor={colors.accent}
      backgroundColor={colors.background}
      minimizeBehavior="never"
      sidebarAdaptable={false}
    >
      {/* UIKit supplies Liquid Glass on iOS 26+, with native tabs on older iOS.
          Keep automatic scroll-view insets so content clears the floating bar. */}
      <NativeTabs.Trigger name="home" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
        />
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="cart"
        contentStyle={contentStyle}
        accessibilityLabel={`Bag, ${count} items`}
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "bag", selected: "bag.fill" }}
        />
        <NativeTabs.Trigger.Label>Bag</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={count === 0}>
          {count > 99 ? "99+" : String(count)}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={contentStyle}>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
        />
        <NativeTabs.Trigger.Label>My space</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
