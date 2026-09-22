/**
 * MERRAINCOGNITA LLC demonstration wholesale apparel catalog.
 * These are illustrative catalog entries (isSample: true) representing the kind of men's,
 * women's, footwear, and accessories lines MERRAINCOGNITA LLC sells wholesale — not a live,
 * purchasable inventory feed. Several listings reference real, widely distributed wholesale
 * "blank" apparel and promotional-product lines (Gildan, Hanes, Fruit of the Loom, Bella+Canvas,
 * Champion, Port Authority, Independent Trading Co., Red Kap, Carhartt, Yupoong, Liberty Bags)
 * for realism, the way a genuine apparel wholesaler's catalog would — MERRAINCOGNITA LLC is not a
 * verified authorized distributor of these brands, and this is not a live, purchasable inventory
 * feed; see the trademark disclaimer on the Terms and Conditions page. Other listings are
 * MERRAINCOGNITA's own private-label lines. Prices are illustrative wholesale unit prices only.
 * Photography is free-license stock imagery representative of each product type (see
 * ASSET_SOURCES.md) — not manufacturer packaging photography or photography of MERRAINCOGNITA's
 * own physical inventory.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Product } from '../models/Product.js';

function productImage(filename: string, alt: string) {
  return {
    url: `/images/products/${filename}`,
    alt,
    sortOrder: 0,
  };
}

const products = [
  // --- Men's Apparel -----------------------------------------------------------
  {
    name: 'Gildan 5000 Heavy Cotton T-Shirt',
    slug: 'gildan-5000-heavy-cotton-tshirt',
    sku: 'MC-MA-101',
    brand: 'Gildan',
    category: 'mens-apparel' as const,
    subcategory: 'T-Shirts',
    price: 3.85,
    currency: 'USD',
    size: 'S–5XL',
    description:
      'The industry-standard 5.3 oz. heavyweight cotton tee, widely used across the wholesale and promotional-apparel trade for screen printing and embroidery. Consistent fit and shrinkage across a full size run makes it a dependable case-pack staple for retailers, uniform programs, and decorators.',
    highlights: [
      'Sold in case packs of 72 (S–XL) or 36 (2XL–5XL)',
      '100% cotton, 5.3 oz. heavyweight construction',
      'Consistent sizing across bulk production runs',
      'Available in over 30 core colorways',
    ],
    images: [productImage('mens-crew-neck-tshirt.jpg', 'Folded heavyweight cotton t-shirts stacked for bulk order')],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Gildan 5000 Heavy Cotton T-Shirt Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Case-pack pricing on the Gildan 5000 heavyweight cotton t-shirt for wholesale buyers.',
  },
  {
    name: 'MERRAINCOGNITA Straight-Leg Denim Jeans',
    slug: 'merraincognita-straight-leg-denim-jeans',
    sku: 'MC-MA-102',
    brand: 'MERRAINCOGNITA',
    category: 'mens-apparel' as const,
    subcategory: 'Denim',
    price: 11.5,
    currency: 'USD',
    size: '28–42 (waist)',
    description:
      "A classic straight-leg five-pocket denim jean in a mid-weight wash, part of MERRAINCOGNITA's own private-label denim line. Built for reliable fit consistency across a full size run — a wholesale staple for apparel retailers stocking everyday men's denim.",
    highlights: [
      'Full waist and inseam size run available',
      'Mid-weight stretch-cotton denim',
      'Reinforced stitching at stress points',
      'Available in indigo and black washes',
    ],
    images: [productImage('mens-straight-leg-denim.jpg', "Folded men's straight-leg denim jeans")],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: "Men's Straight-Leg Denim Jeans Wholesale | MERRAINCOGNITA LLC",
    seoDescription: 'Mid-weight straight-leg denim jeans, MERRAINCOGNITA private label, available wholesale.',
  },
  {
    name: 'Champion S700 Powerblend Fleece Hoodie',
    slug: 'champion-s700-powerblend-hoodie',
    sku: 'MC-MA-103',
    brand: 'Champion',
    category: 'mens-apparel' as const,
    subcategory: 'Fleece & Outerwear',
    price: 12.4,
    currency: 'USD',
    size: 'S–3XL',
    description:
      "Champion's widely stocked Powerblend fleece pullover hoodie — a cotton-poly blend with a kangaroo pocket and ribbed cuffs, popular with decorators and retailers for its brand recognition and reliable print/embroidery surface.",
    highlights: [
      'Cotton-polyester Powerblend fleece',
      'Double-lined hood with matching drawcord',
      'Recognized retail brand with strong sell-through',
      'Available in core and seasonal colorways',
    ],
    images: [productImage('mens-fleece-hoodie.jpg', 'Pullover fleece hoodie on a hanger')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Champion Powerblend Fleece Hoodie Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Champion S700 Powerblend fleece hoodies available for wholesale and bulk order.',
  },
  {
    name: 'Port Authority S508 Short Sleeve Easy Care Shirt',
    slug: 'port-authority-s508-easy-care-shirt',
    sku: 'MC-MA-104',
    brand: 'Port Authority',
    category: 'mens-apparel' as const,
    subcategory: 'Shirts',
    price: 8.9,
    currency: 'USD',
    size: 'XS–6XL',
    description:
      'Port Authority style S508 is a wash-and-wear short-sleeve work shirt made from 4.5-ounce, 55/45 cotton-poly fabric. Its wrinkle-resistant construction, button-down collar, box back pleat, and left chest pocket make it a practical uniform and corporate-apparel staple.',
    highlights: [
      '4.5-ounce, 55/45 cotton-poly fabric',
      'Button-down collar and dyed-to-match buttons',
      'Box back pleat and left chest pocket',
      'Manufacturer size range from XS–6XL',
    ],
    images: [productImage('mens-poplin-shirt.jpg', 'Button-down broadcloth shirt on a hanger')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Port Authority S508 Easy Care Shirt Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Port Authority S508 short-sleeve easy-care work shirts for wholesale buyers.',
  },
  {
    name: 'Red Kap PT88 Industrial Cargo Pant',
    slug: 'red-kap-pt88-industrial-cargo-pant',
    sku: 'MC-MA-105',
    brand: 'Red Kap',
    category: 'mens-apparel' as const,
    subcategory: 'Workwear',
    price: 15.2,
    currency: 'USD',
    size: '30–50 (waist)',
    description:
      "Red Kap's PT88 industrial cargo pant uses 7.5-ounce 65/35 polyester-cotton twill with a wrinkle-resistant finish. Six-pocket construction and two concealed-snap cargo pockets provide storage while preserving a clean uniform profile.",
    highlights: [
      '7.5-ounce, 65/35 polyester-cotton twill',
      'Six pockets, including two concealed-snap cargo pockets',
      'Wrinkle-resistant, industrial-laundry-friendly finish',
      'Waist sizes 30–50 with multiple inseam options',
    ],
    images: [productImage('mens-cargo-pants.jpg', 'Folded relaxed-fit cargo work pants')],
    stockStatus: 'low-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Red Kap PT88 Industrial Cargo Pant Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Red Kap PT88 industrial cargo work pants available for wholesale ordering.',
  },

  // --- Women's Apparel -----------------------------------------------------------
  {
    name: "Bella+Canvas 6400 Women's Relaxed Jersey Tee",
    slug: 'bella-canvas-6400-womens-relaxed-tee',
    sku: 'MC-WA-201',
    brand: 'Bella+Canvas',
    category: 'womens-apparel' as const,
    subcategory: 'T-Shirts',
    price: 5.1,
    currency: 'USD',
    size: 'XS–2XL',
    description:
      "Bella+Canvas's 6400 relaxed-fit jersey tee — a fashion-forward staple in the promotional and retail apparel trade, prized for its soft hand-feel and consistent fit across a full size run.",
    highlights: [
      'Sold in case packs of 24',
      'Soft, fine-jersey cotton-blend knit',
      'Consistent fit across bulk production',
      'Available in an extensive color range',
    ],
    images: [productImage('womens-crew-tee.jpg', "Folded women's relaxed jersey tees stacked for bulk order")],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: "Bella+Canvas Women's Relaxed Jersey Tee Wholesale | MERRAINCOGNITA LLC",
    seoDescription: 'Bella+Canvas 6400 relaxed jersey tees available wholesale in case packs.',
  },
  {
    name: "MERRAINCOGNITA High-Rise Skinny Denim",
    slug: 'merraincognita-high-rise-skinny-denim',
    sku: 'MC-WA-202',
    brand: 'MERRAINCOGNITA',
    category: 'womens-apparel' as const,
    subcategory: 'Denim',
    price: 12.25,
    currency: 'USD',
    size: '24–34 (waist)',
    description:
      "A high-rise skinny fit denim jean in a comfort-stretch wash, part of MERRAINCOGNITA's private-label denim line, offered across a full size run for consistent wholesale fulfillment.",
    highlights: [
      'Comfort-stretch denim construction',
      'Full size run from 24–34',
      'High-rise, skinny through leg',
      'Available in indigo and black washes',
    ],
    images: [productImage('womens-skinny-denim.jpg', "Folded women's high-rise skinny jeans")],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: "Women's High-Rise Skinny Denim Wholesale | MERRAINCOGNITA LLC",
    seoDescription: 'Comfort-stretch high-rise skinny denim, MERRAINCOGNITA private label, available wholesale.',
  },
  {
    name: 'Independent Trading Co. Lightweight Cropped Hoodie',
    slug: 'independent-trading-co-lightweight-cropped-hoodie',
    sku: 'MC-WA-203',
    brand: 'Independent Trading Co.',
    category: 'womens-apparel' as const,
    subcategory: 'Fleece & Outerwear',
    price: 13.6,
    currency: 'USD',
    size: 'XS–XL',
    description:
      "A cropped, full-zip lightweight fleece hoodie from Independent Trading Co., a blank-apparel line favored by decorators and retailers serving a younger streetwear-influenced market.",
    highlights: [
      'Cropped length, full-zip front',
      'Lightweight California-fleece blend',
      'Blank-friendly for decoration',
      'Available in core and seasonal colorways',
    ],
    images: [productImage('womens-cropped-hoodie.jpg', 'Cropped zip-up fleece hoodie on a hanger')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Independent Trading Co. Cropped Zip Hoodie Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Independent Trading Co. lightweight cropped zip hoodies available wholesale.',
  },
  {
    name: 'MERRAINCOGNITA Wrap Midi Dress',
    slug: 'merraincognita-wrap-midi-dress',
    sku: 'MC-WA-204',
    brand: 'MERRAINCOGNITA',
    category: 'womens-apparel' as const,
    subcategory: 'Dresses',
    price: 13.75,
    currency: 'USD',
    size: 'XS–2XL',
    description:
      "A wrap-style midi dress in a lightweight woven fabric, part of MERRAINCOGNITA's private-label fashion line, designed for easy fulfillment across a broad size range for retail and boutique wholesale buyers.",
    highlights: [
      'Lightweight woven fabric with soft drape',
      'Adjustable wrap tie at the waist',
      'Broad size range for retail fulfillment',
      'Available in seasonal prints and solids',
    ],
    images: [productImage('womens-wrap-midi-dress.jpg', "Women's wrap midi dress on a hanger")],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: "Women's Wrap Midi Dress Wholesale | MERRAINCOGNITA LLC",
    seoDescription: 'Lightweight wrap midi dresses, MERRAINCOGNITA private label, available for wholesale boutique buyers.',
  },
  {
    name: "Port Authority L344 Women's Zephyr Full-Zip Jacket",
    slug: 'port-authority-l344-womens-zephyr-jacket',
    sku: 'MC-WA-205',
    brand: 'Port Authority',
    category: 'womens-apparel' as const,
    subcategory: 'Outerwear',
    price: 17.3,
    currency: 'USD',
    size: 'XS–4XL',
    description:
      "Port Authority style L344 is an unlined, 100% polyester full-zip jacket with wind- and water-resistant performance. A zip-through cadet collar, chin guard, elastic binding, and open front pockets make it a versatile layer for uniform and corporate-apparel programs.",
    highlights: [
      'Unlined 100% polyester shell',
      'Wind- and water-resistant performance',
      'Zip-through cadet collar with chin guard',
      'Manufacturer size range from XS–4XL',
    ],
    images: [productImage('womens-bomber-jacket.jpg', 'Lightweight bomber jacket on a hanger')],
    stockStatus: 'low-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: "Port Authority L344 Women's Zephyr Jacket Wholesale | MERRAINCOGNITA LLC",
    seoDescription: "Port Authority L344 women's Zephyr full-zip jackets available for wholesale ordering.",
  },

  // --- Footwear -----------------------------------------------------------------
  {
    name: 'MERRAINCOGNITA Canvas Low-Top Sneaker',
    slug: 'merraincognita-canvas-low-top-sneaker',
    sku: 'MC-FW-301',
    brand: 'MERRAINCOGNITA',
    category: 'footwear' as const,
    subcategory: 'Sneakers',
    price: 7.9,
    currency: 'USD',
    size: 'US 5–13',
    description:
      "A classic unbranded canvas low-top sneaker with a rubber sole, part of MERRAINCOGNITA's private-label footwear line, offered across a broad unisex size run for general footwear retailers.",
    highlights: [
      'Durable canvas upper',
      'Rubber outsole for everyday wear',
      'Broad unisex size run',
      'Available in core colorways',
    ],
    images: [productImage('canvas-low-top-sneaker.jpg', 'Plain canvas low-top sneakers')],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Canvas Low-Top Sneaker Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Classic canvas low-top sneakers, MERRAINCOGNITA private label, available for wholesale footwear buyers.',
  },
  {
    name: 'MERRAINCOGNITA Classic Leather Oxford',
    slug: 'merraincognita-classic-leather-oxford',
    sku: 'MC-FW-302',
    brand: 'MERRAINCOGNITA',
    category: 'footwear' as const,
    subcategory: 'Dress Shoes',
    price: 22.0,
    currency: 'USD',
    size: 'US 7–13',
    description:
      "A classic leather oxford dress shoe with a leather sole and clean cap toe, part of MERRAINCOGNITA's private-label footwear line, built for formalwear and workwear apparel wholesale programs.",
    highlights: [
      'Genuine leather upper',
      'Classic cap-toe oxford construction',
      'Suited to formalwear and uniform programs',
      'Available in black and brown',
    ],
    images: [productImage('mens-leather-oxford.jpg', 'Classic leather oxford dress shoe')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Classic Leather Oxford Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Classic leather oxford dress shoes, MERRAINCOGNITA private label, available for wholesale ordering.',
  },
  {
    name: 'MERRAINCOGNITA Slip-On Flat',
    slug: 'merraincognita-slip-on-flat',
    sku: 'MC-FW-303',
    brand: 'MERRAINCOGNITA',
    category: 'footwear' as const,
    subcategory: 'Flats',
    price: 9.25,
    currency: 'USD',
    size: 'US 5–11',
    description:
      "A simple slip-on flat with a cushioned footbed, part of MERRAINCOGNITA's private-label footwear line, designed as an everyday retail staple across a full women's size run.",
    highlights: [
      'Cushioned footbed for everyday comfort',
      'Slip-on, no-hardware design',
      "Full women's size run",
      'Available in core colorways',
    ],
    images: [productImage('womens-slip-on-flat.jpg', "Women's slip-on flat shoe")],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Slip-On Flat Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Everyday slip-on flats, MERRAINCOGNITA private label, available for wholesale footwear buyers.',
  },
  {
    name: 'MERRAINCOGNITA Athletic Running Shoe',
    slug: 'merraincognita-athletic-running-shoe',
    sku: 'MC-FW-304',
    brand: 'MERRAINCOGNITA',
    category: 'footwear' as const,
    subcategory: 'Athletic',
    price: 14.6,
    currency: 'USD',
    size: 'US 5–13',
    description:
      "A lightweight athletic running shoe with a breathable mesh upper and cushioned midsole, part of MERRAINCOGNITA's private-label footwear line, offered across a broad unisex size run.",
    highlights: [
      'Breathable mesh upper',
      'Cushioned athletic midsole',
      'Broad unisex size run',
      'Available in core colorways',
    ],
    images: [productImage('unisex-running-shoe.jpg', 'Athletic running shoe, unbranded')],
    stockStatus: 'out-of-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Athletic Running Shoe Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Lightweight athletic running shoes, MERRAINCOGNITA private label, available for wholesale ordering.',
  },

  // --- Accessories -----------------------------------------------------------------
  {
    name: 'MERRAINCOGNITA Woven Leather Belt',
    slug: 'merraincognita-woven-leather-belt',
    sku: 'MC-AC-401',
    brand: 'MERRAINCOGNITA',
    category: 'accessories' as const,
    subcategory: 'Belts',
    price: 5.1,
    currency: 'USD',
    size: '30–46 (in)',
    description:
      "A woven genuine-leather belt with a simple metal buckle, part of MERRAINCOGNITA's private-label accessories line, offered across a full waist-size run for general apparel and accessories retailers.",
    highlights: [
      'Genuine woven leather construction',
      'Simple, durable metal buckle',
      'Full waist-size run',
      'Available in black and brown',
    ],
    images: [productImage('woven-leather-belt.jpg', 'Woven leather belt with metal buckle')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Woven Leather Belt Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Woven genuine-leather belts, MERRAINCOGNITA private label, available for wholesale accessories buyers.',
  },
  {
    name: 'Yupoong 6089M Classic Snapback Cap',
    slug: 'yupoong-6089m-classic-snapback-cap',
    sku: 'MC-AC-402',
    brand: 'Yupoong',
    category: 'accessories' as const,
    subcategory: 'Headwear',
    price: 4.6,
    currency: 'USD',
    size: 'One size, adjustable',
    description:
      "Yupoong's 6089M — the classic structured six-panel snapback that anchors most wholesale cap programs — flat-brim, mid-profile, and blank-friendly for embroidery and patch decoration.",
    highlights: [
      'Sold in case packs of 24',
      'Structured six-panel, mid-profile construction',
      'Snapback closure, one size fits most',
      'The industry-standard blank for embroidery and patches',
    ],
    images: [productImage('cotton-baseball-cap.jpg', 'Structured snapback cap')],
    stockStatus: 'in-stock' as const,
    featured: true,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Yupoong 6089M Classic Snapback Cap Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Yupoong 6089M classic snapback caps, the wholesale industry standard blank, sold by the case.',
  },
  {
    name: 'Liberty Bags Canvas Tote',
    slug: 'liberty-bags-canvas-tote',
    sku: 'MC-AC-403',
    brand: 'Liberty Bags',
    category: 'accessories' as const,
    subcategory: 'Bags',
    price: 4.35,
    currency: 'USD',
    size: '15" x 16"',
    description:
      "Liberty Bags' heavyweight cotton canvas tote with reinforced handles, a promotional-products staple suited to retail, event, and general merchandising wholesale programs.",
    highlights: [
      'Heavyweight cotton canvas',
      'Reinforced stitched handles',
      'Blank-friendly for printing and embroidery',
      'Available in natural and dyed colorways',
    ],
    images: [productImage('canvas-tote-bag.jpg', 'Canvas tote bag')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Liberty Bags Canvas Tote Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Liberty Bags heavyweight canvas totes available for wholesale ordering.',
  },
  {
    name: 'Carhartt CTA18 Acrylic Watch Cap',
    slug: 'carhartt-cta18-acrylic-watch-cap',
    sku: 'MC-AC-404',
    brand: 'Carhartt',
    category: 'accessories' as const,
    subcategory: 'Headwear',
    price: 6.75,
    currency: 'USD',
    size: 'One size',
    description:
      "Carhartt's CTA18 ribbed knit acrylic watch cap in a classic cuffed fit — a recognized workwear brand and a seasonal wholesale staple for accessories and apparel retailers.",
    highlights: [
      'Ribbed knit acrylic construction',
      'Classic cuffed fit, one size',
      'Recognized workwear brand with strong sell-through',
      'Available in core colorways',
    ],
    images: [productImage('wool-blend-beanie.jpg', 'Knit acrylic watch cap beanie')],
    stockStatus: 'in-stock' as const,
    featured: false,
    published: true,
    archived: false,
    isSample: true,
    seoTitle: 'Carhartt Acrylic Watch Cap Wholesale | MERRAINCOGNITA LLC',
    seoDescription: 'Carhartt CTA18 acrylic watch caps available for wholesale ordering.',
  },
];

async function seed() {
  await connectDatabase();

  // Re-running the seed should reconcile the sample catalog, including renamed styles,
  // without touching any real products created through the admin interface.
  const sampleSlugs = products.map((product) => product.slug);
  const { deletedCount: removed } = await Product.deleteMany({
    isSample: true,
    slug: { $nin: sampleSlugs },
  });

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const existing = await Product.exists({ slug: product.slug });
    await Product.findOneAndUpdate({ slug: product.slug }, { $set: product }, { upsert: true, new: true });
    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.info(
    `[seed] Wholesale catalog: ${created} created, ${updated} updated, ${removed} stale sample rows removed (${products.length} total).`,
  );

  await disconnectDatabase();
}

seed().catch((error) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
