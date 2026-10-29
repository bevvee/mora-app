import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "Home" | "Cart" | "Profile";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  color: string;
};

type CartItem = Product & { quantity: number };

const products: Product[] = [
  {
    id: 1,
    name: "Glow Face Serum",
    category: "Skincare",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=85",
    color: "#F4E8DC",
  },
  {
    id: 2,
    name: "Soft Rose Lipstick",
    category: "Makeup",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=85",
    color: "#F5E3E5",
  },
  {
    id: 3,
    name: "Daily Hydrating Cream",
    category: "Skincare",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=85",
    color: "#EDE9DF",
  },
  {
    id: 4,
    name: "Signature Eau de Parfum",
    category: "Fragrance",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=85",
    color: "#F4E8DE",
  },
];

const categories = ["All", "Skincare", "Makeup", "Fragrance"];

const tabIcons: Record<Tab, string> = {
  Home: "⌂",
  Cart: "🛍",
  Profile: "♙",
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredProducts = products.filter(
    (product) =>
      (category === "All" || product.category === category) &&
      product.name.toLowerCase().includes(search.toLowerCase()),
  );

  function addToCart(product: Product) {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);

      return exists
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + amount } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {activeTab === "Home" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.brand}>mora.</Text>
                <Text style={styles.brandCaption}>YOUR EVERYDAY GLOW</Text>
              </View>

              <TouchableOpacity
                style={styles.bagButton}
                onPress={() => setActiveTab("Cart")}
                accessibilityLabel={`Open cart, ${cartCount} items`}
              >
                <Text style={styles.bagIcon}>🛍</Text>
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Find your next beauty essential"
                placeholderTextColor="#A19A96"
                style={styles.searchInput}
                accessibilityLabel="Search products"
              />
            </View>

            {/* Hero */}
            <View style={styles.hero}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1000&auto=format&fit=crop&q=90",
                }}
                style={styles.heroImage}
              />

              <View style={styles.heroShade} />

              <View style={styles.heroContent}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>THE GLOW EDIT</Text>
                </View>

                <Text style={styles.heroTitle}>
                  A little care.{"\n"}A lot of glow.
                </Text>

                <Text style={styles.heroDescription}>
                  Discover beauty essentials{"\n"}made for your everyday ritual.
                </Text>

                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => {
                    setCategory("Skincare");
                    setSearch("");
                  }}
                >
                  <Text style={styles.heroButtonText}>Explore skincare</Text>
                  <Text style={styles.heroArrow}>↗</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
            >
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.category,
                    category === item && styles.categoryActive,
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item && styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.eyebrow}>CURATED FOR YOU</Text>
                <Text style={styles.sectionTitle}>Your new favorites</Text>
              </View>

              <Text style={styles.productCount}>
                {filteredProducts.length} items
              </Text>
            </View>

            {/* Products */}
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <View
                    style={[
                      styles.productImageBox,
                      { backgroundColor: product.color },
                    ]}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                    />

                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(product)}
                      accessibilityLabel={`Add ${product.name} to cart`}
                    >
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price} MAD</Text>
                </View>
              ))}
            </View>

            {filteredProducts.length === 0 && (
              <Text style={styles.emptyText}>No matching products found.</Text>
            )}

            <View style={styles.promise}>
              <Text style={styles.promiseIcon}>✧</Text>
              <View style={styles.promiseCopy}>
                <Text style={styles.promiseTitle}>
                  Beauty in the little things
                </Text>
                <Text style={styles.promiseText}>
                  Make a little space for yourself, every day.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === "Cart" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.pageEyebrow}>YOUR BEAUTY BAG</Text>
            <Text style={styles.pageTitle}>My cart</Text>
            <Text style={styles.pageSubtitle}>
              {cartCount} {cartCount === 1 ? "essential" : "essentials"} picked
              for your ritual.
            </Text>

            {cart.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🛍</Text>
                <Text style={styles.emptyTitle}>Your bag is waiting</Text>
                <Text style={styles.emptyText}>
                  Find something lovely for your daily routine.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setActiveTab("Home")}
                >
                  <Text style={styles.primaryButtonText}>Explore Mora</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cart.map((item) => (
                  <View key={item.id} style={styles.cartRow}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cartImage}
                    />

                    <View style={styles.cartDetails}>
                      <Text style={styles.productCategory}>
                        {item.category}
                      </Text>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productPrice}>{item.price} MAD</Text>
                    </View>

                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => changeQuantity(item.id, -1)}
                        style={styles.quantityButton}
                        accessibilityLabel={`Remove one ${item.name}`}
                      >
                        <Text style={styles.quantitySymbol}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => changeQuantity(item.id, 1)}
                        style={styles.quantityButton}
                        accessibilityLabel={`Add one ${item.name}`}
                      >
                        <Text style={styles.quantitySymbol}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalPrice}>{total} MAD</Text>
                </View>

                <Text style={styles.checkoutNote}>
                  Shipping and checkout will be available soon.
                </Text>
              </>
            )}
          </ScrollView>
        )}

        {activeTab === "Profile" && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.pageEyebrow}>YOUR MORA SPACE</Text>
            <Text style={styles.pageTitle}>My profile</Text>

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <Text style={styles.emptyTitle}>Hello, beautiful</Text>
              <Text style={styles.profileDescription}>
                Your beauty journey starts here.
              </Text>
              <View style={styles.guestPill}>
                <Text style={styles.guestText}>Browsing as a guest</Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.promiseTitle}>A little about Mora</Text>
              <Text style={styles.profileDescription}>
                Everyday beauty essentials, thoughtfully curated for your
                personal routine.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom tabs */}
      <View style={styles.tabBar}>
        {(["Home", "Cart", "Profile"] as Tab[]).map((tab) => {
          const selected = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab}
            >
              <View
                style={[styles.tabIconBox, selected && styles.tabIconBoxActive]}
              >
                <Text
                  style={[styles.tabIcon, selected && styles.tabIconActive]}
                >
                  {tabIcons[tab]}
                </Text>

                {tab === "Cart" && cartCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[styles.tabLabel, selected && styles.tabLabelActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FCFAF7" },
  content: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: {
    fontSize: 44,
    fontWeight: "600",
    letterSpacing: -3,
    color: "#49362E",
  },
  brandCaption: {
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 2.2,
    color: "#988278",
    marginTop: 1,
  },
  bagButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F1EAE4",
    alignItems: "center",
    justifyContent: "center",
  },
  bagIcon: { fontSize: 21 },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#936852",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1EDE8",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
    gap: 10,
  },
  searchIcon: { fontSize: 27, color: "#8E7B70" },
  searchInput: {
    flex: 1,
    color: "#49362E",
    fontSize: 13,
    height: "100%",
  },
  hero: {
    height: 330,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#D6BDA7",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 29, 20, 0.36)",
  },
  heroContent: { flex: 1, padding: 25, justifyContent: "center" },
  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroTagText: {
    color: "#FFF9F3",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },
  heroTitle: {
    color: "#FFF9F3",
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "600",
    letterSpacing: -1.2,
  },
  heroDescription: {
    fontSize: 13,
    color: "#F6EDE6",
    lineHeight: 20,
    marginTop: 12,
  },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FCF7F0",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 22,
  },
  heroButtonText: { fontSize: 12, fontWeight: "600", color: "#49362E" },
  heroArrow: { fontSize: 18, color: "#49362E" },
  categories: { gap: 10, paddingVertical: 25 },
  category: {
    paddingHorizontal: 21,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#F0EAE4",
  },
  categoryActive: { backgroundColor: "#745341" },
  categoryText: { fontSize: 12, color: "#8C796E", fontWeight: "500" },
  categoryTextActive: { color: "#FFF9F3" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 19,
  },
  eyebrow: { fontSize: 9, color: "#A18573", letterSpacing: 1.8 },
  sectionTitle: {
    fontSize: 24,
    color: "#49362E",
    fontWeight: "600",
    letterSpacing: -0.7,
    marginTop: 6,
  },
  productCount: { fontSize: 11, color: "#A18C7F" },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: { width: "48%", marginBottom: 25 },
  productImageBox: {
    height: 190,
    borderRadius: 19,
    overflow: "hidden",
    marginBottom: 12,
  },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  addButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { fontSize: 24, color: "#745341", lineHeight: 28 },
  productCategory: { fontSize: 10, color: "#A18A7C", marginBottom: 5 },
  productName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#49362E",
    lineHeight: 19,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#745341",
    marginTop: 6,
  },
  promise: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F1EAE2",
    borderRadius: 18,
    padding: 19,
  },
  promiseIcon: { fontSize: 33, color: "#9B7760" },
  promiseCopy: { flex: 1 },
  promiseTitle: { fontSize: 13, fontWeight: "600", color: "#614837" },
  promiseText: { fontSize: 11, color: "#9A8373", marginTop: 5, lineHeight: 17 },
  pageEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#A18573",
    marginTop: 18,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "600",
    color: "#49362E",
    marginTop: 10,
    letterSpacing: -1,
  },
  pageSubtitle: {
    color: "#A18A7C",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 25,
  },
  emptyState: { alignItems: "center", paddingVertical: 65 },
  emptyIcon: { fontSize: 50, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "600", color: "#49362E" },
  emptyText: {
    color: "#9A8373",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#745341",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 25,
  },
  primaryButtonText: { fontSize: 13, fontWeight: "600", color: "#FFF9F3" },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE5DD",
    gap: 12,
  },
  cartImage: { width: 70, height: 85, borderRadius: 12 },
  cartDetails: { flex: 1 },
  quantityControl: { alignItems: "center", gap: 7 },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: "#F0EAE4",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantitySymbol: { fontSize: 19, color: "#745341" },
  quantity: { fontSize: 12, color: "#49362E", fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    alignItems: "center",
  },
  totalLabel: { fontSize: 17, color: "#49362E" },
  totalPrice: { fontSize: 22, fontWeight: "700", color: "#745341" },
  checkoutNote: { color: "#A18A7C", fontSize: 12, marginTop: 15 },
  profileCard: {
    backgroundColor: "#F1EAE2",
    borderRadius: 24,
    padding: 30,
    marginTop: 28,
    alignItems: "center",
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#E2D3C5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarText: { fontSize: 32, color: "#745341" },
  profileDescription: {
    color: "#9A8373",
    fontSize: 13,
    lineHeight: 22,
    marginTop: 9,
    textAlign: "center",
  },
  guestPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#E8DDD2",
    borderRadius: 20,
    marginTop: 20,
  },
  guestText: { fontSize: 11, color: "#745341" },
  profileInfo: { padding: 25, alignItems: "center" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FCFAF7",
    borderTopWidth: 1,
    borderTopColor: "#EDE6DF",
    paddingTop: 10,
    paddingBottom: 8,
  },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  tabIconBox: {
    width: 55,
    height: 32,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconBoxActive: { backgroundColor: "#EDE2D7" },
  tabIcon: { fontSize: 25, color: "#B3A296" },
  tabIconActive: { color: "#745341" },
  tabLabel: { fontSize: 10, fontWeight: "500", color: "#B3A296" },
  tabLabelActive: { color: "#745341", fontWeight: "700" },
  tabBadge: {
    position: "absolute",
    top: -4,
    right: 0,
    backgroundColor: "#936852",
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
});
