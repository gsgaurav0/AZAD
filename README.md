# MewaK — Haute Couture Editorial E-Commerce Frontend

A modern, responsive e-commerce frontend for clothing and fashion brand **"MewaK"**, taking aesthetic layout cues from **Zara** and **Myntra** with a refined editorial aesthetic.

> **Powered by Kashyap Communication** 🌸

---

## 🎨 Brand & Design System

- **Brand Wordmark:** Serif `MEWAK` in deep espresso brown with a gold leaf icon nesting the letter `K`.
- **Footer Attribution:** *"Powered by Kashyap Communication"* with the gold flower icon.
- **Color Palette:**
  - Background: `#EFE8DD`
  - Surface: `#FBF7F0`
  - Text: `#2B1A16`
  - Accent Gold: `#9A8029` (Hover: `#7F6A1F`)
  - Border: `#DDD2C0`
  - Sale Red: `#B3402F`
  - Success Green: `#4C7A34`
- **Typography:**
  - Headings: `Playfair Display` (editorial serif)
  - Body: `DM Sans` (clean modern sans-serif)
- **Aesthetic Principles:** Large high-resolution fashion imagery, generous whitespace, thin 1px borders, 4px subtle rounded corners, minimal shadows, and smooth micro-animations.

---

## 🚀 Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom brand tokens
- **State Management:** Zustand with `persist` middleware (local storage for Cart, Wishlist, Authentication, Saved Addresses, Orders, and Recently Viewed)
- **Icons:** `lucide-react`
- **Micro-Animations & Delights:** Framer Motion, CSS transitions, and `canvas-confetti` celebration on order placement.

---

## 🛍️ Features & Pages

### 1. Global Navigation & Layout
- **Announcement Bar:** Rotating promotional updates ("Free shipping above Rs.999 | Easy 15-day returns", VIP Concierge contact).
- **Sticky Editorial Header:**
  - Wordmark Logo with gold leaf `K` icon.
  - Interactive Mega Menu: Men, Women, Kids, New In, and Archival Sale with subcategory links & curated runway photography.
  - Live Search Modal: Real-time search suggestions with product thumbnail previews, prices, and fast keyboard navigation.
  - Wishlist count badge.
  - Patron Account link / Modal trigger.
  - Cart bag count badge.
- **Cart Drawer:** Right-side slide-in drawer on Add to Cart, dynamic free shipping progress bar, quantity/size adjuster, and promo code support (`MEWAK10`, `WELCOME50`).
- **Mobile Navigation:**
  - Side drawer navigation for small screens.
  - Fixed mobile bottom dock: Home, Shop, Wishlist, Bag, and Account.
- **Concierge WhatsApp:** Floating pulse button with interactive stylist concierge prompt.
- **Global Toast Alerts:** Instant feedback for adding to bag, wishlisting, applying coupons, and saving addresses.

### 2. Home Page (`/`)
- **Full-Screen Hero:** Oversized editorial typography, background imagery, and dual CTAs.
- **Bento-Grid Category Tiles:** Asymmetric fashion tiles for Women, Men, Kids, and Accessories with smooth zoom animations.
- **New Arrivals Carousel:** Smooth draggable/arrow-controlled product carousel.
- **Shop by Occasion:** Interactive pill switcher for *Party & Soirée*, *Executive & Work*, *Festive & Ethnic*, and *Resort & Casual*.
- **"Shop the Look" Lookbook Banner:** Interactive hotspot pins directly on the model image—click pins to preview garment details and add directly to bag!
- **Trending This Season Grid:** 8 hot-selling pieces with badges and rating tags.
- **Brand Story Section:** *"The Art of Sartorial Harmony"* narrative on sustainable slow fashion, master weavers, and noble non-synthetic fabrics.
- **Instagram Gallery:** 6 curated square tiles linking to `@mewakfashion`.
- **Patron Testimonials:** Interactive quote slider featuring verified buyer badges.

### 3. Product Catalog & Listing (`/shop`, `/shop/[category]`, `/search`)
- **Sidebar & Mobile Drawer Filters:**
  - Collection category switcher
  - Subcategory checklists
  - Size pills (XS to XXL)
  - Color swatches with live color ring selection
  - Price range slider (₹1,000 to ₹12,000)
  - Noble fabric filter (Mulberry Silk, French Linen, Merino Wool, Organic Cotton, Florentine Leather)
  - Silhouette / Fit filter (Relaxed, Tailored, Slim, Oversized)
  - Minimum star rating filter
- **Sort Dropdown:** Featured, Price: Low to High, Price: High to Low, Rating, and Newest.
- **Column View Toggles:** 2, 3, or 4-column desktop layout.
- **Load More Pagination** with item count progress.
- **Empty State** with quick reset action.

### 4. Product Detail Page (`/product/[slug]`)
- **High-Resolution Gallery:** Vertical thumbnails, touch swipe, and interactive zoom lens.
- **Color & Size Selectors:** Disabled states for sold-out sizes and low-stock warning alerts.
- **Size Guide Modal:** Comprehensive charts in both Inches and Centimeters with measurement instructions.
- **Delivery Availability Checker:** Live 6-digit Indian pincode validation with delivery timeline and COD checks.
- **Action Suite:** "Add to Bag", "Buy Now", and Wishlist toggle.
- **Collapsible Accordions:** Sartorial Details, Fabric & Care, and Returns.
- **Complete the Look:** Recommended complementary pieces.
- **Patron Reviews:** Star breakdown and interactive review submission form.
- **Recently Viewed Items:** Dynamic carousel of previously inspected pieces.
- **Mobile Sticky CTA Bar:** Fixed bottom bar for frictionless purchasing on mobile devices.

### 5. Wishlist (`/wishlist`)
- Grid of saved items with quick size picker, direct "Move to Bag", and remove actions.
- Empty state with direct shopping links.

### 6. Cart Page (`/cart`)
- Quantity increment/decrement steppers.
- Live size changer dropdown per item.
- Move to wishlist & remove actions.
- Promo coupon engine supporting `MEWAK10` (10% off) and `WELCOME50` (₹500 off orders &gt; ₹1,999).
- Order summary with subtotal, product discount, shipping calculation, and grand total.

### 7. 3-Step Checkout (`/checkout`)
1. **Address:** Select from saved addresses or add a new delivery destination with full validation.
2. **Payment Mode:** Instant UPI (GPay/PhonePe/Paytm), Credit/Debit Card, Net Banking, or Cash on Delivery.
3. **Review & Confirm:** Complete order verification, item breakdown, and place order button.

### 8. Order Success (`/order-success/[orderId]`)
- Dynamic confetti celebration!
- Order reference identifier (e.g. `MWK-829104`).
- Delivery summary and direct links to track order in account.

### 9. Patron Account Dashboard (`/account`)
- **Profile:** Patron name, tier ("Gold Connoisseur"), phone, and registered email.
- **My Orders:** Detailed order cards with interactive 5-step visual tracking timeline (*Placed -> Packed -> Shipped -> Out for Delivery -> Delivered*).
- **Return / Exchange Form:** Doorstep reverse pickup scheduler with reason selector and refund mode (Original or Store Credit).
- **Saved Addresses:** Add, edit, remove, and toggle default address.

### 10. Patron Help & Information Pages
- `/about`: Brand story, slow fashion ethos, founder note.
- `/contact`: Concierge contact form, showroom addresses in New Delhi, Mumbai, and Bengaluru.
- `/faq`: Categorized accordions for orders, shipping, returns, and fabrics.
- `/size-guide`: Detailed size measurement charts.
- `/shipping`: Delivery policy and tiers.
- `/returns`: 15-day return and exchange policy.
- `/privacy` & `/terms`: Privacy and terms.
- `not-found.tsx`: Custom editorial 404 page.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience MewaK.

### 3. Production Build Validation
```bash
npm run build
```

---

© 2026 MewaK Atelier. Powered by Kashyap Communication 🌸
