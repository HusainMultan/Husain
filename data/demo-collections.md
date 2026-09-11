# Demo data setup — Karun Jewellers

Shopify does not support importing collections via CSV, so this file documents
how to set them up in Admin after importing `demo-products.csv`
(Admin → Products → Import).

## 1. Import products

Admin → Products → Import → upload `demo-products.csv`. This creates 18 demo
products across Rings, Earrings, Necklaces and Bracelets, tagged so the
automated collections below populate themselves.

No product photography is included — the theme automatically falls back to a
clean placeholder illustration wherever a product/collection image is
missing, so the site remains fully functional. Add real photography via
Admin → Products → (product) → Media before launch.

## 2. Create these collections (Admin → Collections → Create collection)

Use **Automated** collections with the conditions below so future products
tagged/typed the same way are included automatically.

| Collection          | Conditions                                   |
|----------------------|-----------------------------------------------|
| New Arrivals         | Tag is equal to `new-arrivals`                |
| Rings                | Product type is equal to `Rings`              |
| Earrings             | Product type is equal to `Earrings`           |
| Necklaces            | Product type is equal to `Necklaces`          |
| Bracelets            | Product type is equal to `Bracelets`          |
| Gold Jewellery       | Tag is equal to `gold`                        |
| Silver Jewellery     | Tag is equal to `silver`                      |
| Wedding Jewellery    | Tag is equal to `wedding`                     |
| Gifts                | Tag is equal to `gifts`                       |
| Best Sellers         | Tag is equal to `bestseller`                  |

Set the collection handle to match the theme's expectations where used
directly (e.g. `new-arrivals`, `best-sellers`, `rings`, `earrings`,
`necklaces`, `bracelets`) — Shopify does this automatically from the title
unless you override it.

Add a `Karun Jewellers`-appropriate image to each collection (Admin →
Collections → (collection) → Image) for the homepage "Featured Collections"
section and mega menu — otherwise a placeholder graphic is shown.

## 3. Menus

Create a menu handled `main-menu` (Admin → Online Store → Navigation) with
top-level items such as New Arrivals, Jewellery (with Rings/Earrings/
Necklaces/Bracelets as sub-links, which the header renders as a mega menu),
Collections, Gifts, About Us.

## 4. Metafields (optional, referenced by the product page "Details" tab)

Add these Product metafields under the `custom` namespace for richer product
detail content: `material`, `stone`, `size_fit`, `care_instructions`.

## 5. What is *not* included

Certification, gold purity, ethical sourcing, handmade and hallmarking
claims have deliberately been left out of all demo copy, since none of
these can be verified for placeholder data. Add only claims that are true
for the real Karun Jewellers catalogue.
