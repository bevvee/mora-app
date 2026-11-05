# MORA

MORA is a mobile-first beauty shop built with Expo SDK 58, React Native, Expo Router, TypeScript, and Redux Toolkit. Its warm cream, cocoa, and muted rose palette carries through the shop, product studio, and navigation.

## Run locally

```sh
npm install
npx expo start
# Browser preview
npx expo start --web
```

Use `npx expo install <package>` when adding dependencies so native packages match Expo SDK 58. The native 3D view uses `expo-gl`, `expo-asset`, and `expo-file-system`. These modules are bundled in supported Expo Go versions; rebuild an existing development client after adding native dependencies. Test the native renderer on a physical device rather than a remote JS debugger.

## Product studio

- Fifteen reference-based 3D models, matching the supplied MORA collection: Petal Toner, Silk Cleanser, Cloud Cream, Dew Serum, Sun Veil, Velvet Lip, Rose Tint, Lash Muse, Honey Gloss, Skin Silk, Vanille Douce, Bois de Soie, Fleur de Lune, Éclat, and Rose Ambrée.
- React Three Fiber renders the packaging; Drei supplies geometry, texture loading, and a local studio environment with window-like light reflections. No external model, font, or HDR download is required.
- The home page has a composed 3D product scene. Product cards identify available previews, and product pages offer 3D/photo tabs, horizontal dragging, rotation arrows, play/pause, and reset.
- The models reconstruct the visible packaging from the supplied reference photos, including ivory/chocolate finishes, glass flasks, sculptural caps, pumps, droppers, tubes, and the slanted lipstick tip. These are modeled interpretations of single views; unseen sides are inferred. The original photos remain available in the gallery. Printed wordmarks and fine lettering are sampled from the original, unchanged PNGs through curved UV decals.
- Scenes render on demand while still. Automatic rotation is opt-in and respects reduced-motion settings. Scenes unmount on navigation/backgrounding; the home scene also unmounts when scrolled away. Catalog cards use photos so scrolling does not allocate a separate WebGL context for each product.
- Renderer/loading failures fall back to the product photo. Broken photo state resets when recycled list items receive a new source.
- Legend List powers the home grid, search results, category browsing, and filtered product grids, with stable keys and item recycling.

The model registry lives in `src/domain/product-presentation.ts`; geometry is in `src/components/three/product-model.tsx`. Add an explicit registry entry and model for new products. The 15 original PNGs live in `assets/products`; their portable asset registry is `src/components/three/reference-assets.ts`. Label UV windows, fine-ink filtering, and printed surfaces are in `reference-label.tsx`. Catalog data and the one-time migration are in `src/domain/mora-catalog.ts`. Platform-specific runtime modules select the native Fiber entry point on iOS/Android, the browser Fiber entry point on web, and only the shared Drei helpers used by the scenes.

## Current features

- Browse, search, and filter the beauty catalog by category and subcategory. Search ignores accents (for example, Eclat finds Éclat) and matches product descriptions/types, so lipstick, foundation, and parfum remain useful queries for the branded product names.
- Inspect the 15 product photos and matching 3D packaging previews. All imported prices are clearly marked as demo prices; change prices and the demo toggle in the existing product editor when real prices are available.
- Add products to a locally persisted bag and adjust quantities.
- Create local demo accounts, edit account details, and view local order history.
- Complete a demo checkout with delivery details and demo-card or cash options.
- Use the existing local admin screens to manage products and inspect customers and orders.

This repository is a local demo client. Authentication, administrator mode, and password recovery run on the device; they are not a production security boundary. No real payment is charged. The AI assistant described in the original product brief is not implemented. A production release requires server-side authentication/authorization, validated inventory/pricing, a payment integration, and a backend for orders and AI features.

## Source layout

- `src/app`: Expo Router routes and navigators.
- `src/features`: shop, product, search, account, bag, checkout, and admin screens.
- `src/components/shop`: shared visual styles, headers, buttons, cards, photos, and product gallery.
- `src/components/three`: native/web rendering adapters, models, product stage, and error boundary.
- `src/domain`: catalog, product presentation, local authentication, and store rules.
- `src/state`: Redux state, serialized persistence, and React providers.
- `tests`: domain and persistence regression tests.

## Validate

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo export --platform web
# Also verify Metro can bundle both native targets:
npx expo export --platform ios --platform android
```

For graphics and gesture QA, open each of the 15 product pages, rotate/reset the model, switch photo/3D modes, add a product to the bag, filter/search the catalog, and test with reduced motion enabled. Check iOS and Android on physical devices before release.

## Saved catalogs

Catalog revision 2 upgrades the untouched four-product sample catalog once and adds the supplied collection. It keeps existing product IDs, hidden flags, edited prices/descriptions, custom products/photos, customer records, bag quantities, and historical order snapshots. Repurposed IDs receive a separate reference entry with a collision-safe ID. A revision marker prevents deleted or hidden products from being restored on subsequent launches. Migration writes complete before Redux publishes the new state; a failed write leaves saved data untouched and can be retried.
