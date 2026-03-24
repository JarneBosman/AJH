import {
  CategorySlug,
  CustomizationOption,
  Product,
  ProductCategory,
} from "@/types/shop";

export const categories: ProductCategory[] = [
  {
    slug: "tables",
    name: "Tables",
    description:
      "Statement dining and work tables crafted from solid hardwoods.",
    heroImage:
      "https://images.unsplash.com/photo-1595515106864-0779d49f9502?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "chairs",
    name: "Chairs",
    description:
      "Comfort-driven seating with bespoke fabrics and sculpted joinery.",
    heroImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "cabinets",
    name: "Cabinets",
    description: "Architectural storage systems tailored to your interior palette.",
    heroImage:
      "https://images.unsplash.com/photo-1616628182509-6f4f7f92716f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "shelving",
    name: "Shelving",
    description:
      "Modular shelving with premium finishes for quiet, elevated spaces.",
    heroImage:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80",
  },
];

export const customizationOptionsByCategory: Record<string, CustomizationOption[]> = {
  tables: [
    {
      id: "size",
      label: "Size",
      helperText: "Choose a top size that suits your space.",
      type: "dropdown",
      choices: [
        { id: "compact", label: "160 x 90 cm", priceModifier: 0 },
        { id: "family", label: "200 x 95 cm", priceModifier: 280 },
        { id: "grand", label: "240 x 100 cm", priceModifier: 560 },
      ],
    },
    {
      id: "material",
      label: "Material",
      helperText: "Hand-selected wood with natural grain variation.",
      type: "swatch",
      choices: [
        {
          id: "oak",
          label: "Natural Oak",
          priceModifier: 0,
          swatchHex: "#c9a97c",
        },
        {
          id: "walnut",
          label: "Dark Walnut",
          priceModifier: 220,
          swatchHex: "#6e4c34",
        },
        {
          id: "smoked-oak",
          label: "Smoked Oak",
          priceModifier: 150,
          swatchHex: "#8a6f56",
        },
      ],
    },
  ],
  chairs: [
    {
      id: "size",
      label: "Size",
      type: "dropdown",
      choices: [
        { id: "standard", label: "Standard", priceModifier: 0 },
        { id: "large", label: "Large", priceModifier: 120 },
      ],
    },
    {
      id: "material",
      label: "Material",
      type: "swatch",
      choices: [
        { id: "linen", label: "Soft Linen", priceModifier: 0, swatchHex: "#d2c7b7" },
        {
          id: "boucle",
          label: "Boucle",
          priceModifier: 110,
          swatchHex: "#9b8b7e",
        },
        {
          id: "leather",
          label: "Vegetable Tanned Leather",
          priceModifier: 260,
          swatchHex: "#6e4c34",
        },
      ],
    },
  ],
  cabinets: [
    {
      id: "size",
      label: "Size",
      type: "dropdown",
      choices: [
        { id: "small", label: "Small (90 cm)", priceModifier: 0 },
        { id: "medium", label: "Medium (120 cm)", priceModifier: 150 },
        { id: "large", label: "Large (150 cm)", priceModifier: 300 },
      ],
    },
    {
      id: "material",
      label: "Material",
      type: "swatch",
      choices: [
        { id: "oak", label: "Natural Oak", priceModifier: 0, swatchHex: "#c9a97c" },
        {
          id: "walnut",
          label: "Dark Walnut",
          priceModifier: 260,
          swatchHex: "#6e4c34",
        },
      ],
    },
  ],
  shelving: [
    {
      id: "size",
      label: "Shelf Length",
      type: "dropdown",
      choices: [
        { id: "120", label: "120 cm", priceModifier: 0 },
        { id: "160", label: "160 cm", priceModifier: 90 },
        { id: "200", label: "200 cm", priceModifier: 170 },
      ],
    },
    {
      id: "material",
      label: "Material",
      type: "swatch",
      choices: [
        { id: "oak", label: "Natural Oak", priceModifier: 0, swatchHex: "#c9a97c" },
        {
          id: "walnut",
          label: "Dark Walnut",
          priceModifier: 80,
          swatchHex: "#6e4c34",
        },
      ],
    },
  ],
};

export const products: Product[] = [
  {
    id: "tbl-alto",
    slug: "alto-dining-table",
    name: "Alto Dining Table",
    subtitle: "A refined centerpiece for everyday rituals.",
    description:
      "Crafted from full-stave timber and finished by hand, Alto balances architectural lines with warm tactility.",
    category: "tables",
    basePrice: 1690,
    leadTime: "6-8 weeks",
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1400&q=80",
    ],
    featured: true,
    story:
      "Each top is built from 40 mm stock, then precision-sanded and oil-finished for a satin touch.",
    defaultSelections: {
      size: "family",
      material: "oak",
    },
  },
  {
    id: "tbl-ridge",
    slug: "ridge-work-table",
    name: "Ridge Work Table",
    subtitle: "Built for focused work and long studio days.",
    description:
      "A robust work table with integrated cable relief and high-resilience finishing for daily use.",
    category: "tables",
    basePrice: 1490,
    leadTime: "5-7 weeks",
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1400&q=80",
    ],
    featured: true,
    defaultSelections: {
      size: "compact",
      material: "smoked-oak",
    },
  },
  {
    id: "tbl-lumen",
    slug: "lumen-conference-table",
    name: "Lumen Conference Table",
    subtitle: "A calm anchor for collaborative spaces.",
    description:
      "Wide spans, cable-friendly architecture, and precision joinery define this table's contemporary presence.",
    category: "tables",
    basePrice: 2190,
    leadTime: "7-9 weeks",
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=80",
    ],
    defaultSelections: {
      size: "grand",
      material: "walnut",
    },
  },
  {
    id: "chr-nova",
    slug: "nova-lounge-chair",
    name: "Nova Lounge Chair",
    subtitle: "Soft geometry and supportive comfort.",
    description:
      "A lounge chair with sculpted proportions and tailored upholstery crafted to order.",
    category: "chairs",
    basePrice: 790,
    leadTime: "4-6 weeks",
    images: [
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=1400&q=80",
    ],
    featured: true,
    defaultSelections: {
      size: "standard",
      material: "boucle",
    },
  },
  {
    id: "cab-arc",
    slug: "arc-media-cabinet",
    name: "Arc Media Cabinet",
    subtitle: "Sculpted storage for living spaces.",
    description:
      "A low cabinet with cable channels, soft-close doors, and premium hardware options.",
    category: "cabinets",
    basePrice: 1890,
    leadTime: "6-8 weeks",
    images: [
      "https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=80",
    ],
    defaultSelections: {
      size: "small",
      material: "oak",
    },
  },
  {
    id: "shv-linea",
    slug: "linea-wall-shelf",
    name: "Linea Wall Shelf",
    subtitle: "Minimal shelving with warm material depth.",
    description:
      "Wall-mounted shelving designed for books, objects, and gallery-like displays.",
    category: "shelving",
    basePrice: 390,
    leadTime: "3-4 weeks",
    images: [
      "https://images.unsplash.com/photo-1595425964071-5af4e6b6f06f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1616628182509-6f4f7f92716f?auto=format&fit=crop&w=1400&q=80",
    ],
    defaultSelections: {
      size: "160",
      material: "walnut",
    },
  },
];

export const configuratorBaseTypes = [
  { id: "dining", label: "Dining Table", priceModifier: 0 },
  { id: "desk", label: "Work Desk", priceModifier: -120 },
  { id: "statement", label: "Statement Table", priceModifier: 340 },
];

export const baselineDimensions = {
  width: 200,
  height: 75,
  depth: 95,
};

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getProductsByCategory = (category: CategorySlug) =>
  products.filter((product) => product.category === category);

export const getCustomizationOptions = (category: CategorySlug) =>
  customizationOptionsByCategory[category] ?? [];
