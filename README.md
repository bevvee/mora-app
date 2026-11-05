# MORA — Beauty E-Commerce Mobile App

MORA is a mobile e-commerce application for our own beauty brand, offering skincare, perfumes, and makeup for women. It combines an elegant shopping experience with an AI beauty assistant that helps customers discover products suited to their needs.

## Project status

This README describes the project vision and a proposed extension of the existing file structure. The original route files were provided by the team; their implementation has not been reviewed. New files and features below are planned additions, not a list of completed functionality.

The structure assumes React Native, Expo Router, and TypeScript based on the supplied `.tsx` routes and route groups. Confirm the actual dependencies in `package.json` before implementation.

## Product categories

| Category | Description |
| --- | --- |
| Skincare | Face and body care products from the MORA brand. |
| Perfumes | MORA fragrances for women. |
| Makeup | MORA cosmetic and makeup products. |

## Main features

### Customer experience

- Create an account, sign in, and recover a forgotten password.
- Browse the MORA catalog by category and search for products.
- View product images, descriptions, prices, availability, and relevant product information.
- Add products to the cart and adjust quantities.
- Complete checkout and consult order history and order details.
- Manage account details and delivery addresses.
- Save favorite products in a wishlist.
- Ask the AI beauty assistant for personalized product suggestions.

### Administration

- Access an administrator dashboard.
- Create, edit, and manage products and their availability.
- Manage product categories.
- View customers and customer details.
- View orders and update their fulfillment status.

Delivery addresses, wishlist, category administration, and order administration are proposed additions to the supplied routes. Payment methods, shipping rules, and detailed order statuses remain to be defined.

## AI beauty assistant

The AI assistant helps customers choose products from the MORA catalog through a conversation. Customers describe their skin type, concerns, preferences, or desired results in text.

**Example request:**

> My skin is dry and sensitive. I am looking for a daily moisturizer.

The assistant can ask follow-up questions, identify relevant catalog products, and explain why each recommendation may suit the customer's needs. Recommended products link to their detail pages, where the customer can review them and add them to the cart.

### Proposed recommendation flow

1. The customer describes their needs.
2. The assistant asks for missing information when needed, such as skin type, preferences, or known ingredient sensitivities.
3. The backend retrieves relevant MORA products and their verified catalog information.
4. The assistant returns product references and a short explanation for each suggestion.
5. The app displays product cards with current catalog prices and availability.

Recommendations should use real catalog products and available product data. The assistant should not invent ingredients, product claims, prices, or stock. When no suitable match exists, it should say so. It guides beauty product selection and does not diagnose skin conditions or prescribe treatment.

**Initial scope:** text-based conversations. Face photos, image analysis, and persistent conversation history require separate decisions and are not assumed in this version.

## Proposed project structure

All files from the supplied `src/app` tree are retained below. Files marked `[NEW]` are proposed additions. Supporting folders outside `src/app` are also proposals; merge them with any equivalent folders already present in the actual repository.

```text
mora-app/
├── README.md                              # Project description and structure
└── src/
    ├── app/                               # Expo Router screens and layouts
    │   ├── (auth)/
    │   │   ├── _layout.tsx                 # [NEW] Authentication navigation
    │   │   ├── forgot-password.tsx
    │   │   ├── login.tsx
    │   │   └── signup.tsx
    │   ├── (shop)/
    │   │   ├── _layout.tsx
    │   │   ├── cart.tsx
    │   │   ├── home.tsx
    │   │   ├── profile.tsx
    │   │   └── search.tsx
    │   ├── admin/
    │   │   ├── clients/
    │   │   │   ├── [id].tsx
    │   │   │   └── index.tsx
    │   │   ├── products/
    │   │   │   ├── [id].tsx
    │   │   │   ├── index.tsx
    │   │   │   └── create.tsx              # [NEW] Create a product
    │   │   ├── categories/
    │   │   │   └── index.tsx               # [NEW] Manage categories
    │   │   ├── orders/
    │   │   │   ├── [id].tsx                # [NEW] Manage an order
    │   │   │   └── index.tsx               # [NEW] Order management list
    │   │   ├── _layout.tsx
    │   │   └── index.tsx
    │   ├── assistant/
    │   │   └── index.tsx                   # [NEW] AI beauty conversation
    │   ├── addresses/
    │   │   ├── [id].tsx                    # [NEW] Edit a delivery address
    │   │   ├── create.tsx                  # [NEW] Add a delivery address
    │   │   └── index.tsx                   # [NEW] Saved delivery addresses
    │   ├── categories/
    │   │   └── [category].tsx
    │   ├── orders/
    │   │   └── [id].tsx
    │   ├── product/
    │   │   └── [id].tsx
    │   ├── _layout.tsx
    │   ├── about.tsx
    │   ├── account-details.tsx
    │   ├── checkout.tsx
    │   ├── explore.tsx
    │   ├── history.tsx
    │   ├── index.tsx
    │   ├── products.tsx
    │   └── wishlist.tsx                    # [NEW] Saved products
    ├── assets/                            # [NEW] Brand and static assets
    │   ├── fonts/
    │   └── images/
    ├── components/                        # [NEW] Reusable interface pieces
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── TextInput.tsx
    │   │   ├── LoadingState.tsx
    │   │   └── EmptyState.tsx
    │   ├── products/
    │   │   ├── ProductCard.tsx
    │   │   └── ProductFilters.tsx
    │   ├── cart/
    │   │   ├── CartItem.tsx
    │   │   └── OrderSummary.tsx
    │   ├── assistant/
    │   │   ├── ChatMessage.tsx
    │   │   ├── ChatInput.tsx
    │   │   └── RecommendationCard.tsx
    │   └── admin/
    │       └── ProductForm.tsx
    ├── providers/                         # [NEW] Shared application state
    │   ├── AuthProvider.tsx
    │   ├── CartProvider.tsx
    │   └── WishlistProvider.tsx
    ├── hooks/                             # [NEW] Reusable screen behavior
    │   ├── useAuth.ts
    │   ├── useCart.ts
    │   ├── useWishlist.ts
    │   ├── useProducts.ts
    │   └── useAssistant.ts
    ├── services/                          # [NEW] Backend communication
    │   ├── api.ts
    │   ├── auth.service.ts
    │   ├── products.service.ts
    │   ├── categories.service.ts
    │   ├── orders.service.ts
    │   ├── addresses.service.ts
    │   ├── wishlist.service.ts
    │   ├── clients.service.ts
    │   └── assistant.service.ts
    ├── types/                             # [NEW] Shared TypeScript models
    │   ├── user.ts
    │   ├── product.ts
    │   ├── category.ts
    │   ├── cart.ts
    │   ├── order.ts
    │   ├── address.ts
    │   └── assistant.ts
    ├── constants/                         # [NEW] Shared visual values
    │   ├── theme.ts
    │   └── categories.ts
    └── utils/                             # [NEW] Shared helpers
        ├── formatPrice.ts
        └── validation.ts
```

## Folder responsibilities

| Folder | Responsibility |
| --- | --- |
| `src/app` | Route screens and navigation layouts. Screens connect reusable UI to application behavior. |
| `src/components` | Reusable visual components, including product cards, forms, and assistant messages. |
| `src/providers` | Shared authentication, cart, and wishlist state. |
| `src/hooks` | Reusable state access and screen behavior, including product loading and assistant requests. |
| `src/services` | Requests to the backend, with shared request handling in `api.ts`. |
| `src/types` | Shared models for users, products, orders, and assistant responses. |
| `src/constants` | Theme values and stable category identifiers. Backend catalog data remains authoritative. |
| `src/utils` | Small reusable formatting and validation functions. |
| `src/assets` | Static images and fonts packaged with the mobile app. |

### Route organization

- `(auth)` groups the authentication screens.
- `(shop)` contains the main shopping navigation.
- `admin` contains administration screens for authorized administrators.
- `assistant/index.tsx` provides the AI beauty assistant screen.
- `product/[id].tsx` displays one product; `products.tsx` displays the catalog.
- `categories/[category].tsx` displays products within a selected category.
- `history.tsx` displays the customer's order history; `orders/[id].tsx` displays an individual order.
- `index.tsx` remains the entry route. Its welcome or redirect behavior should follow the existing application flow.

Keep reusable components, services, and types outside `src/app`, which is reserved for route files and layouts. Connect the assistant from the shop navigation or home screen without adding duplicate routes.

## Backend and AI integration

The backend framework, database, AI provider, payment provider, and deployment setup have not yet been selected in this specification. This tree describes the mobile client only.

The backend will need to handle authentication, administrator permissions, catalog data, customer records, addresses, order creation, and AI recommendation requests. Prices, stock, and order totals must be validated by the backend at checkout. Administrator access must also be enforced by the backend.

The mobile app should send assistant requests through the backend. AI provider secrets belong on the server and must not be embedded in the mobile app. The assistant service should return catalog product identifiers that the app resolves into product cards.

## Decisions still to confirm

- Payment methods: online payment, cash on delivery, or both.
- Shipping areas, fees, and fulfillment statuses.
- Whether checkout requires an account.
- Backend framework, database, and AI provider.
- Whether assistant conversations are temporary or saved to customer accounts.
- Exact dependency versions and installation commands from the real repository.

## Suggested implementation order

1. Review the existing routes and extract shared UI components.
2. Complete the catalog, categories, search, and product details.
3. Complete authentication, cart, checkout, and customer orders.
4. Complete administrator product, customer, category, and order management.
5. Add the text-based AI assistant using real MORA catalog data.
6. Add the proposed wishlist and saved address screens as needed.

