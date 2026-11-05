export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  image: string;
  hidden: boolean;
  demoPrice?: boolean;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};
export type CartLine = { productId: string; quantity: number };
export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};
export type Payment = "demo-card" | "cash";
export type Order = {
  id: string;
  customerId: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  shipping: Customer;
  payment: Payment;
  status: "Demo paid" | "Payment on delivery";
};
export type Store = {
  version: 1;
  catalogRevision?: number;
  products: Product[];
  customers: Customer[];
  activeCustomerId: string;
  cart: CartLine[];
  orders: Order[];
};
export const categories = ["Skincare", "Makeup", "Fragrance"];
export const money = (value: number) => `${value.toFixed(2)} MAD`;
export const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export function initialStore(): Store {
  return {
    version: 1,
    products: [
      {
        id: "serum",
        subcategory: "Serums",
        name: "Glow Face Serum",
        category: "Skincare",
        price: 189,
        description:
          "A lightweight serum for your daily glow ritual. Apply a few drops to clean skin before your moisturizer.",
        image:
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700&auto=format&fit=crop&q=85",
        hidden: false,
      },
      {
        id: "lipstick",
        subcategory: "Lips",
        name: "Soft Rose Lipstick",
        category: "Makeup",
        price: 99,
        description:
          "A soft rose shade with a creamy finish. An effortless touch of color for every day.",
        image:
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700&auto=format&fit=crop&q=85",
        hidden: false,
      },
      {
        id: "cream",
        subcategory: "Moisturizers",
        name: "Daily Hydrating Cream",
        category: "Skincare",
        price: 149,
        description:
          "Make time for a little care. Massage gently into clean skin as part of your morning or evening routine.",
        image:
          "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700&auto=format&fit=crop&q=85",
        hidden: false,
      },
      {
        id: "perfume",
        subcategory: "Eau de parfum",
        name: "Signature Eau de Parfum",
        category: "Fragrance",
        price: 299,
        description:
          "Your everyday signature. A beautifully balanced fragrance to finish your personal ritual.",
        image:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop&q=85",
        hidden: false,
      },
    ],
    customers: [
      {
        id: "local-customer",
        name: "Mora Guest",
        email: "",
        phone: "",
        address: "",
        city: "",
      },
    ],
    activeCustomerId: "local-customer",
    cart: [],
    orders: [],
  };
}
export function validateProfile(customer: Customer): string | undefined {
  if (!customer.name.trim()) return "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()))
    return "Enter a valid email address.";
  if (customer.phone && customer.phone.replace(/\D/g, "").length < 8)
    return "Enter a valid phone number.";
}
export function validateCustomer(customer: Customer): string | undefined {
  if (!customer.name.trim()) return "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()))
    return "Enter a valid email address.";
  if (customer.phone.replace(/\D/g, "").length < 8)
    return "Enter a valid phone number.";
  if (!customer.address.trim() || !customer.city.trim())
    return "Enter your delivery address and city.";
}
export function validateProduct(product: Product): string | undefined {
  if (
    !product.name.trim() ||
    !product.category.trim() ||
    !product.description.trim()
  )
    return "Name, category and description are required.";
  if (
    !Number.isFinite(product.price) ||
    product.price <= 0 ||
    product.price > 1_000_000
  )
    return "Enter a price between 0.01 and 1,000,000 MAD.";
  if (
    Math.round(product.price * 100) !== product.price * 100 &&
    Math.abs(Math.round(product.price * 100) - product.price * 100) > 0.00001
  )
    return "Use at most two decimal places.";
  const bundledImage =
    /^mora-asset:(petal-toner|silk-cleanser|cloud-cream|dew-serum|sun-veil|velvet-lip|rose-tint|lash-muse|honey-gloss|skin-silk|vanille-douce|bois-de-soie|fleur-de-lune|eclat|rose-ambree)$/.test(
      product.image,
    );
  if (!bundledImage && !/^https?:\/\/\S+$/i.test(product.image))
    return "Enter a valid http or https image URL.";
}
export function cartDetails(store: Store) {
  return store.cart
    .map((line) => ({
      ...line,
      product: store.products.find((product) => product.id === line.productId),
    }))
    .filter(
      (line): line is CartLine & { product: Product } =>
        !!line.product && !line.product.hidden,
    );
}
export const cartTotal = (store: Store) =>
  Math.round(
    cartDetails(store).reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    ) * 100,
  ) / 100;
export type Action =
  | { type: "cart"; productId: string; amount: number }
  | { type: "save-customer"; customer: Customer }
  | { type: "register-customer"; customer: Customer }
  | { type: "switch-customer"; id: string }
  | { type: "save-product"; product: Product }
  | { type: "delete-product"; id: string }
  | {
      type: "checkout";
      id: string;
      createdAt: string;
      shipping: Customer;
      payment: Payment;
    };
export function updateStore(store: Store, action: Action): Store {
  switch (action.type) {
    case "cart": {
      const product = store.products.find(
        (item) => item.id === action.productId && !item.hidden,
      );
      if (!product) throw new Error("This product is no longer available.");
      const quantity =
        (store.cart.find((line) => line.productId === product.id)?.quantity ??
          0) + action.amount;
      if (!Number.isInteger(quantity) || quantity > 99)
        throw new Error("You can add up to 99 of each item.");
      return {
        ...store,
        cart: [
          ...store.cart.filter((line) => line.productId !== product.id),
          ...(quantity > 0 ? [{ productId: product.id, quantity }] : []),
        ],
      };
    }
    case "register-customer": {
      const error = validateProfile(action.customer);
      if (error) throw new Error(error);
      const customer = {
        ...action.customer,
        id: action.customer.id.trim(),
        name: action.customer.name.trim(),
        email: action.customer.email.trim().toLowerCase(),
      };
      if (
        !customer.id ||
        store.customers.some((item) => item.id === customer.id)
      )
        throw new Error("A profile with this ID already exists.");
      if (
        store.customers.some(
          (item) => item.email.trim().toLowerCase() === customer.email,
        )
      )
        throw new Error("A profile with this email already exists.");
      return { ...store, customers: [...store.customers, customer] };
    }
    case "save-customer": {
      const error = validateProfile(action.customer);
      if (error) throw new Error(error);
      const customer = Object.fromEntries(
        Object.entries(action.customer).map(([key, value]) => [
          key,
          value.trim(),
        ]),
      ) as Customer;
      return {
        ...store,
        customers: [
          ...store.customers.filter((item) => item.id !== customer.id),
          customer,
        ],
      };
    }
    case "switch-customer":
      if (!store.customers.some((customer) => customer.id === action.id))
        throw new Error("Customer not found.");
      return { ...store, activeCustomerId: action.id, cart: [] };
    case "save-product": {
      const error = validateProduct(action.product);
      if (error) throw new Error(error);
      return {
        ...store,
        products: [
          ...store.products.filter((item) => item.id !== action.product.id),
          action.product,
        ],
        cart: action.product.hidden
          ? store.cart.filter((line) => line.productId !== action.product.id)
          : store.cart,
      };
    }
    case "delete-product":
      return {
        ...store,
        products: store.products.filter((product) => product.id !== action.id),
        cart: store.cart.filter((line) => line.productId !== action.id),
      };
    case "checkout": {
      const error = validateCustomer(action.shipping);
      if (error) throw new Error(error);
      if (action.shipping.id !== store.activeCustomerId)
        throw new Error("Your active profile changed. Reopen checkout.");
      const lines = cartDetails(store);
      if (!lines.length || lines.length !== store.cart.length)
        throw new Error("Your cart changed. Please review it before checkout.");
      if (store.orders.some((order) => order.id === action.id))
        throw new Error("This order has already been placed.");
      if (action.payment !== "demo-card" && action.payment !== "cash")
        throw new Error("Select a payment method.");
      const order: Order = {
        id: action.id,
        createdAt: action.createdAt,
        customerId: store.activeCustomerId,
        shipping: { ...action.shipping },
        payment: action.payment,
        status:
          action.payment === "demo-card" ? "Demo paid" : "Payment on delivery",
        total: cartTotal(store),
        items: lines.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
      };
      return {
        ...store,
        cart: [],
        customers: store.customers.map((customer) =>
          customer.id === action.shipping.id
            ? { ...action.shipping }
            : customer,
        ),
        orders: [order, ...store.orders],
      };
    }
  }
}
// Validate stored data before making it available to the UI. Never silently replace an unreadable store.
export function parseStore(raw: string): Store {
  const value: unknown = JSON.parse(raw);
  const record = (item: unknown): item is Record<string, unknown> =>
    !!item && typeof item === "object";
  const strings = (item: Record<string, unknown>, keys: string[]) =>
    keys.every((key) => typeof item[key] === "string");
  const customer = (item: unknown): item is Customer =>
    record(item) &&
    strings(item, ["id", "name", "email", "phone", "address", "city"]);
  const positive = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n > 0;
  if (
    !record(value) ||
    value.version !== 1 ||
    (value.catalogRevision !== undefined &&
      (!Number.isSafeInteger(value.catalogRevision) ||
        (value.catalogRevision as number) < 0)) ||
    !Array.isArray(value.products) ||
    !value.products.every(
      (p) =>
        record(p) &&
        strings(p, ["id", "name", "category", "description", "image"]) &&
        positive(p.price) &&
        typeof p.hidden === "boolean" &&
        (p.demoPrice === undefined || typeof p.demoPrice === "boolean") &&
        (p.subcategory === undefined || typeof p.subcategory === "string"),
    ) ||
    !Array.isArray(value.customers) ||
    !value.customers.every(customer) ||
    !value.customers.some((c) => c.id === value.activeCustomerId) ||
    !Array.isArray(value.cart) ||
    !value.cart.every(
      (c) =>
        record(c) &&
        typeof c.productId === "string" &&
        positive(c.quantity) &&
        Number.isInteger(c.quantity) &&
        (c.quantity as number) <= 99,
    ) ||
    !Array.isArray(value.orders) ||
    !value.orders.every(
      (o) =>
        record(o) &&
        strings(o, ["id", "customerId", "createdAt"]) &&
        Number.isFinite(Date.parse(o.createdAt as string)) &&
        customer(o.shipping) &&
        positive(o.total) &&
        ["cash", "demo-card"].includes(o.payment as string) &&
        ["Demo paid", "Payment on delivery"].includes(o.status as string) &&
        Array.isArray(o.items) &&
        o.items.length > 0 &&
        o.items.every(
          (i) =>
            record(i) &&
            strings(i, ["productId", "name"]) &&
            positive(i.price) &&
            positive(i.quantity) &&
            Number.isInteger(i.quantity),
        ),
    )
  ) {
    throw new Error(
      "Saved data could not be read. Your local data has been preserved.",
    );
  }
  return value as Store;
}
