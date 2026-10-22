export type Brand = {
  id: string;
  name: string;
  models: string[];
};

export const brands: Brand[] = [
  {
    id: "apple",
    name: "Apple",
    models: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone SE", "Other Apple"],
  },
  {
    id: "samsung",
    name: "Samsung",
    models: ["Galaxy A series", "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24", "Galaxy Z Flip", "Galaxy Z Fold", "Other Samsung"],
  },
  {
    id: "tecno",
    name: "Tecno",
    models: ["Spark series", "Camon series", "Phantom series", "Pop series", "Other Tecno"],
  },
  {
    id: "infinix",
    name: "Infinix",
    models: ["Hot series", "Note series", "Smart series", "Zero series", "Other Infinix"],
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    models: ["Redmi Note", "Redmi", "Poco", "Xiaomi flagship", "Other Xiaomi"],
  },
  {
    id: "oppo",
    name: "Oppo",
    models: ["A series", "Reno series", "Find series", "Other Oppo"],
  },
  {
    id: "huawei",
    name: "Huawei",
    models: ["Y series", "Nova series", "P series", "Mate series", "Other Huawei"],
  },
  {
    id: "google",
    name: "Google",
    models: ["Pixel 6", "Pixel 7", "Pixel 8", "Pixel 9", "Other Pixel"],
  },
  {
    id: "nokia",
    name: "Nokia",
    models: ["G series", "C series", "Other Nokia"],
  },
  {
    id: "other",
    name: "Other",
    models: ["Not listed"],
  },
];

export type Service = {
  id: string;
  name: string;
  short: string;
  involves: string;
  icon: "screen" | "battery" | "water" | "lock" | "chip" | "board" | "charge" | "cloud" | "help";
};

export const services: Service[] = [
  {
    id: "screen-repair",
    name: "Screen repair",
    short: "Cracked, dark, or unresponsive glass.",
    involves:
      "We power-test the phone, remove the broken display, fit a replacement, and check touch, brightness, and sensors before it leaves the bench.",
    icon: "screen",
  },
  {
    id: "battery-replacement",
    name: "Battery replacement",
    short: "Drains fast, swells, or shuts off.",
    involves:
      "We check battery health and swelling, fit a replacement cell, and confirm the phone charges and holds power.",
    icon: "battery",
  },
  {
    id: "water-damage",
    name: "Water damage",
    short: "Liquid, rain, or a drop in the sink.",
    involves:
      "We open the phone, look for corrosion, clean what we can, and test power, charging, and sound. What we find decides the next step.",
    icon: "water",
  },
  {
    id: "software-unlock",
    name: "Software unlock",
    short: "Network or software locks, after a look.",
    involves:
      "We identify the lock or software fault first. Work only starts once we know what the phone is asking for.",
    icon: "lock",
  },
  {
    id: "ic-repair",
    name: "IC repair / reballing",
    short: "Chip-level faults under the shields.",
    involves:
      "Board-level chip work for faults a new screen or battery will not fix — power, charging, or no-boot issues.",
    icon: "chip",
  },
  {
    id: "motherboard-repair",
    name: "Motherboard repair",
    short: "Logic-board faults that need a deeper look.",
    involves:
      "Deeper logic-board repair when the fault sits on the board. We diagnose before any heavy work.",
    icon: "board",
  },
  {
    id: "charging",
    name: "Charging issues",
    short: "Loose port, slow charge, or no charge.",
    involves:
      "We test the port, cable path, and charging circuit, then repair or replace the part that failed.",
    icon: "charge",
  },
  {
    id: "frp-icloud",
    name: "FRP / iCloud unlocking",
    short: "Account lock help for a device you own.",
    involves:
      "We confirm the model and the lock type before any work. This is for a phone you own. We do not publish bypass steps on this site.",
    icon: "cloud",
  },
];

export const notSureService: Service = {
  id: "not-sure",
  name: "Not sure",
  short: "We will name the fault before any repair.",
  involves: "Book a look. Tell us what the phone is doing and we will diagnose it on the bench.",
  icon: "help",
};

export const problemChips = [
  "Cracked screen",
  "Battery drains fast",
  "Water damage",
  "Won't charge",
  "Won't turn on",
  "No sound",
  "Overheating",
  "Software lock",
] as const;

export const accessoryCategories = ["All", "Charging", "Power banks", "Cables", "Audio", "In-car"] as const;
export type AccessoryCategory = Exclude<(typeof accessoryCategories)[number], "All">;

export type Accessory = {
  id: string;
  name: string;
  category: AccessoryCategory;
  label: string;
  blurb: string;
  features: string[];
  image: string;
  alt: string;
  officialHref: string;
};

/**
 * Product names, specifications, images, and URLs are sourced from the
 * supplied official Oraimo Ghana catalog. Price and stock stay live there.
 */
export const accessories: Accessory[] = [
  {
    id: "powercube-202",
    name: "PowerCube 202",
    category: "Charging",
    label: "20W charger kit",
    blurb: "A compact UK-type wall charger kit for everyday phone charging.",
    features: ["20W output", "UK-type plug", "9-layer protection"],
    image: "/images/store/powercube-202.png",
    alt: "Oraimo PowerCube 202 black wall charger kit",
    officialHref:
      "https://gh.oraimo.com/product/oraimo-powercube-202-uk-type-plug-20w-compatible-charger-kit-ocw-5202u?ean=4894947097164",
  },
  {
    id: "powernova-l21",
    name: "PowerNova L21",
    category: "Power banks",
    label: "20,000mAh power bank",
    blurb: "Multi-device power with a clear display for the charge that remains.",
    features: ["30W power", "2 Type-C and 1 USB-A", "Smart display"],
    image: "/images/store/powernova-l21.png",
    alt: "Oraimo PowerNova L21 graphite black power bank",
    officialHref:
      "https://gh.oraimo.com/product/oraimo-powernova-l21-20000mah-30w-power-bank-opb-7203c?ean=4894947105456",
  },
  {
    id: "braidline-100w",
    name: "BraidLine 100W",
    category: "Cables",
    label: "Type-C to Type-C cable",
    blurb: "A braided cable built for high-power charging and everyday data transfer.",
    features: ["100W maximum", "Up to 480Mbps", "1-metre braided cable"],
    image: "/images/store/braidline-100w.png",
    alt: "Oraimo BraidLine 100W black Type-C cable",
    officialHref:
      "https://gh.oraimo.com/product/oraimo-braidline-100w-type-c-to-type-c-tear-resistant-data-cable-ocd-1525cc?ean=4894947101519",
  },
  {
    id: "spacebuds-2",
    name: "SpaceBuds 2",
    category: "Audio",
    label: "True wireless earbuds",
    blurb: "Long-play wireless audio with smart controls in the charging case.",
    features: ["Up to 45-hour playtime", "AI translation", "Smart case controls"],
    image: "/images/store/spacebuds-2.png",
    alt: "Oraimo SpaceBuds 2 wireless earbuds and smart charging case",
    officialHref:
      "https://gh.oraimo.com/product/oraimo-spacebuds-2-true-wireless-earbuds-otw-631-spacegrey?ean=4894947114120",
  },
  {
    id: "powerdrive-7691-pro",
    name: "PowerDrive 7691 Pro",
    category: "In-car",
    label: "69W dual car charger",
    blurb: "Two-port charging for phones and other devices while you travel.",
    features: ["69W maximum", "USB-A and Type-C", "Dual-device charging"],
    image: "/images/store/powerdrive-7691.png",
    alt: "Oraimo PowerDrive 7691 Pro black dual car charger",
    officialHref:
      "https://gh.oraimo.com/product/oraimo-powerdrive-7691-pro-69w-dual-super-car-charger-occ-7691d?ean=4894947102059",
  },
];

export function brandById(id: string) {
  return brands.find((brand) => brand.id === id);
}

export function serviceById(id: string) {
  if (id === notSureService.id) return notSureService;
  return services.find((service) => service.id === id);
}

export function needsCustomModel(model: string) {
  return /other|not listed/i.test(model);
}
