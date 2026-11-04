# Mora

An Expo 58 / React Native beauty shop with Expo Router navigation. The app currently runs with device-local data; Firebase and payment services are not connected.

## Run

```sh
npm install
npx expo start
```

Use a matching Expo Go version or a development build with the installed native modules. Run local tests with Node 24 or newer.

```sh
npm run lint
npm run typecheck
npm test
```

## Structure

- `src/app/`: route entry points and navigator layouts only.
- `src/features/search/`: product-name search, category and subcategory browsing, and filtered product results.
- `src/features/catalog/`: catalog search, categories and product detail.
- `src/features/cart/` and `src/features/checkout/`: bag quantities, delivery form and simulated checkout.
- `src/features/account/`: My Space profile card/menu, personal details and order history.
- `src/features/auth/`: separate login, signup and password-recovery screens.
- `src/features/admin/`: dashboard, product editor, visibility/deletion and customer history.
- `src/components/shop/`: shared fixed header, accessible buttons, form fields and design colors. Icons use Lucide React Native.
- `src/domain/`: types, local business rules and stored-data validation without UI dependencies.
- `src/state/`: Redux Toolkit slices, typed hooks and async operations for shop data, local accounts, hydration and admin mode. Storage writes are serialized and published to Redux after persistence succeeds.
- `src/components/navigation/`: native iOS tabs and JavaScript tabs for Android/web.
- `tests/`: business-rule and local-account tests.

## Navigation and appearance

iOS uses the native system tab bar with Liquid Glass on supported iOS 26+ builds. Header icon buttons use Expo GlassEffect when the runtime supports it and Reduce Transparency is off. Older iOS versions, Android and web retain accessible standard controls. The iOS tab bar uses SF Symbols; the other platforms and header actions use individually imported Lucide icons.

## Local behavior

The Search tab offers product-name search and category -> subcategory -> product browsing. Admin product forms include subcategory assignment; old saved seed products keep their existing groups.

Open My Space to create an account or log in. Signup shows a recovery code: save it to use the separate forgot-password page. Accounts and hashed demo credentials are stored on this device; no email is sent. This is prototype authentication, not production identity infrastructure.

My Space shows the profile card first, followed by menu links for personal information, order history, the bag, app information and the local admin workspace. Profile editing lives on its own page. Admin is an explicitly entered local demo and has no privileged backend or admin authentication.

Products, customers, the active bag and order history persist through AsyncStorage. Switching accounts clears the bag. Hidden/deleted products are removed from the bag; saved orders retain their original product names and prices. Order detail views are scoped to the active customer, except while the admin demo is active.

Checkout offers cash on delivery and simulated card payment. Both create local demo orders and collect no money or card details. Delivery is free in this prototype. Seed product photos use external URLs and need internet; the app handles unavailable images with a placeholder.

Storage is versioned and validated before use. If saved data cannot be read or written, the app reports the error and preserves the previous data instead of silently resetting it.
