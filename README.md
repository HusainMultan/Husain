# Karun Jewellers — Shopify Online Store 2.0 Theme

A premium, UK-focused Shopify theme for **Karun Jewellers** (London &
Birmingham), built from scratch on Online Store 2.0 architecture (JSON
templates, sections, blocks, theme settings) — no external frameworks.

## Brand identity

- **Palette**: deep burgundy (`#5C0E1B`), ivory/off-white background,
  charcoal text, restrained gold accent — derived from the supplied logo.
  Fully editable in Theme Editor → Theme settings → Colours.
- **Typography**: elegant serif for headings (default Playfair Display),
  clean sans-serif for body/UI (default Jost) — both swappable via Theme
  settings → Typography.
- **Language & currency**: British English throughout; GBP (£) only.

## ⚠️ Logo — action required

The official logo (Karun Jewellers wordmark, diamond mark, "LONDON" /
"BIRMINGHAM") was supplied as a reference image only; its binary file
could not be extracted into this repository. Until it's uploaded, the
header/footer show a styled text fallback so the site is never broken.

**To finish branding:** Admin → Online Store → Themes → Customize →
Theme settings → Logo → upload the original logo file (PNG/SVG with a
transparent background is ideal). No code changes are needed — the
`snippets/logo.liquid` component switches to the image automatically.

## Getting started

1. Install the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) and
   run `shopify theme dev` from this directory to preview against a
   development store, or push directly with `shopify theme push`.
2. Import demo products: Admin → Products → Import → `data/demo-products.csv`
   (18 demo products across Rings, Earrings, Necklaces, Bracelets).
3. Follow `data/demo-collections.md` to create the 10 demo collections and
   the main navigation menu — required for the homepage, mega menu and
   collection pages to populate.
4. Upload the logo (see above) and a favicon in Theme settings.
5. Replace placeholder copy on About, Contact, Delivery, Returns and the
   legal pages (Privacy/Cookie/Terms) with the client's real content —
   each is clearly labelled as placeholder in Theme Editor.

## Structure

```
layout/theme.liquid          Master layout — head, header, drawers, footer
templates/                   JSON templates (Online Store 2.0)
sections/                    Homepage, product, collection, page sections
snippets/                    Reusable components (product-card, price, icons…)
assets/base.css              Design system: tokens, layout, components
assets/global.js              Cart drawer, menus, predictive search, gallery,
                              variant selection, wishlist, scroll animations
config/settings_schema.json   Theme settings (colours, fonts, logo, cart…)
locales/en.default.json       British English UI strings
data/demo-products.csv        18 demo products for Admin import
data/demo-collections.md      Collection & menu setup instructions
```

## Key features implemented

- Sticky, accessible header with mega menu, Ajax cart drawer, predictive
  search drawer, mobile slide-out menu.
- Homepage: hero, featured collections, new arrivals, brand story,
  best sellers, editorial split, trust badges, demo testimonials
  (clearly labelled), London/Birmingham "Visit Us", newsletter.
- Product page: gallery with thumbnails + mobile swipe, variant-aware
  pricing/availability, quantity selector, Add to Basket + Buy It Now,
  collapsible Description/Details/Size/Care/Delivery/Returns, trust
  indicators, sticky mobile Add to Basket bar, product recommendations.
- Collection page: banner, native Shopify filtering (`collection.filters`)
  and sorting, responsive product grid, pagination, mobile filter drawer.
- Ajax cart with free-delivery progress bar (threshold configurable in
  Theme settings), full `/cart` fallback page.
- Search with predictive results drawer + full `/search` results page.
- Account: login, register, order history, order detail.
- Utility pages: FAQ (accordion, block-based), Delivery, Returns, Privacy,
  Cookie, Terms, Size Guide, Wishlist (localStorage-based demo).
- Wishlist heart toggle on product cards (persisted per-browser).
- Scroll-reveal animation system that respects `prefers-reduced-motion`.
- Semantic HTML, skip link, focus states, alt text throughout, breadcrumbs,
  canonical tags — SEO/accessibility foundations.

## Known limitations (by design, given no live store/API access)

- No real product photography — the theme cleanly falls back to
  placeholder illustrations anywhere an image is missing.
- Collections, navigation menus and metafields must be created in Admin
  (not something a theme file can create) — see `data/demo-collections.md`.
- Reviews, certifications, gold purity, ethical-sourcing and hallmarking
  claims are intentionally omitted from demo copy; add only what's true
  for the real catalogue.
