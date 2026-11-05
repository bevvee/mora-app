import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import CircleHelp from "lucide-react-native/icons/circle-question-mark";
import History from "lucide-react-native/icons/rotate-ccw-clock";
import LogIn from "lucide-react-native/icons/log-in";
import LogOut from "lucide-react-native/icons/log-out";
import Pencil from "lucide-react-native/icons/pencil";
import Shield from "lucide-react-native/icons/shield";
import ShoppingBag from "lucide-react-native/icons/shopping-bag";
import UserPlus from "lucide-react-native/icons/user-plus";
import UserRound from "lucide-react-native/icons/user-round";
import type { LucideIcon } from "lucide-react-native";
import { useStore } from "../../state/store-provider";
import { useAuth } from "../../state/auth-provider";
import {
  Button,
  colors,
  errorMessage,
  Screen,
  ui,
} from "../../components/shop/ui";
import { IconButton } from "../../components/shop/app-header";

function MenuItem({
  icon: Icon,
  title,
  subtitle,
  onPress,
  last = false,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        !last && styles.divider,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={styles.menuIcon}>
        <Icon
          size={21}
          color={colors.accent}
          strokeWidth={1.8}
          accessible={false}
        />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={ui.bold}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={colors.muted} accessible={false} />
    </Pressable>
  );
}
export default function ProfileScreen() {
  const { store } = useStore();
  const { account, signOut } = useAuth();
  const customer = store.customers.find(
    (item) => item.id === store.activeCustomerId,
  )!;
  const orders = store.orders.filter(
    (order) => order.customerId === customer.id,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await signOut();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  const initials = customer.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <Screen title="My space" caption="A LITTLE SPACE FOR YOU">
      <View style={[ui.card, styles.profileCard]}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            {account ? (
              <Text style={styles.initials}>{initials}</Text>
            ) : (
              <UserRound size={30} color={colors.accent} strokeWidth={1.5} />
            )}
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={ui.heading}>
              {account ? customer.name : "Welcome to Mora"}
            </Text>
            <Text style={styles.subtitle}>
              {account ? account.email : "Your everyday glow starts here."}
            </Text>
          </View>
          {account && (
            <IconButton
              icon={Pencil}
              label="Edit my profile"
              onPress={() => router.push("/account-details")}
            />
          )}
        </View>
        {account ? (
          <View style={styles.stats}>
            <Text style={ui.bold}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </Text>
            <Text style={ui.body}>Made for your ritual</Text>
          </View>
        ) : (
          <>
            <Text style={ui.body}>
              Sign in to your local account to manage your profile and revisit
              your orders.
            </Text>
            <Button
              title="Log in"
              icon={LogIn}
              onPress={() => router.push("/login")}
            />
            <Button
              title="Create account"
              icon={UserPlus}
              secondary
              onPress={() => router.push("/signup")}
            />
          </>
        )}
      </View>
      <Text style={ui.eyebrow}>YOUR ACCOUNT</Text>
      <View style={styles.menu}>
        <MenuItem
          icon={UserRound}
          title="Personal information"
          subtitle="Your details and delivery address"
          onPress={() => router.push(account ? "/account-details" : "/login")}
        />
        <MenuItem
          icon={History}
          title="Order history"
          subtitle={`${orders.length} saved local ${orders.length === 1 ? "order" : "orders"}`}
          onPress={() => router.push("/history")}
        />
        <MenuItem
          icon={ShoppingBag}
          title="My beauty bag"
          subtitle="Review your everyday essentials"
          onPress={() => router.push("/cart")}
          last
        />
      </View>
      <Text style={ui.eyebrow}>MORE FROM MORA</Text>
      <View style={styles.menu}>
        <MenuItem
          icon={CircleHelp}
          title="About this app"
          subtitle="Local shopping, accounts and checkout"
          onPress={() => router.push("/about")}
        />
        <MenuItem
          icon={Shield}
          title="Admin workspace"
          subtitle="Manage products and customer history"
          onPress={() => router.push("/admin")}
          last
        />
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      {account && (
        <Button
          title={busy ? "Signing out..." : "Sign out"}
          icon={LogOut}
          secondary
          disabled={busy}
          onPress={() => {
            void logout();
          }}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#F5EDE4",
    borderColor: "#E7D9C8",
    padding: 22,
  },
  profileTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#E6D6C3",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: { fontSize: 22, fontWeight: "600", color: colors.accent },
  stats: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 15,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  menu: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  menuItem: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
