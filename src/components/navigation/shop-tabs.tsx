import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import House from "lucide-react-native/icons/house";
import Search from "lucide-react-native/icons/search";
import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import UserRound from "lucide-react-native/icons/user-round";
import { useStore } from "../../state/store-provider";
import { cartDetails } from "../../domain/store";
import { colors } from "../shop/theme";

export default function ShopTabs() {
  const insets = useSafeAreaInsets();
  const { store } = useStore();
  const count = cartDetails(store).reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 68 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarBadgeStyle: {
          backgroundColor: colors.accent,
          color: colors.white,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size, focused }) => (
            <House
              color={color}
              size={size}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Search
              color={color}
              size={size}
              strokeWidth={focused ? 2.2 : 1.6}
              aria-hidden={true}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Bag",
          tabBarBadge: count || undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <ShoppingBag
              color={color}
              size={size}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "My space",
          tabBarIcon: ({ color, size, focused }) => (
            <UserRound
              color={color}
              size={size}
              strokeWidth={focused ? 2.2 : 1.6}
            />
          ),
        }}
      />
    </Tabs>
  );
}
