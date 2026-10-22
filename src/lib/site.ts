/**
 * Shop details. Replace every [PLACEHOLDER] token before going live.
 * The open/closed badge and booking calendar use `placeholderSchedule`
 * until real hours are entered. See README.
 */
export const site = {
  name: "Ultimate GSM",
  tagline: "We Fix It. You Love It.",
  slogan: "Phone Repair Specialist",
  expertLine: "Expert Phone Repairs. Quality You Can Trust.",
  phone: "[PHONE NUMBER]",
  email: "nyamebright450@gmail.com",
  address: "[ADDRESS]",
  hours: "[HOURS]",
  whatsappLink: "[WHATSAPP LINK]",
  oraimoStoreUrl: "https://gh.oraimo.com/",
  oraimoDealsUrl:
    "https://gh.oraimo.com/oraimo-daily-deals.html?utm_source=google&utm_medium=google/cpc&campaignid=22266021028&kwd=orimo&gad_source=1&gad_campaignid=22266021028&gbraid=0AAAAA-z-V4HtfOxHp7ZAn4LCeYuFlt9hA&gclid=CjwKCAjwxeHWBhBPEiwAiqtQ-Zl_Zvbs8IAXyT8r_zwAO7Z7RqDFOwHbuGN6Ur8THXsnkbry6oTYUBoCUT8QAvD_BwE",
  /**
   * Digits only, country code included, no plus. Example: 2348012345678.
   * Leave blank to open a pre-filled WhatsApp draft without a shop number.
   */
  whatsappNumber: "",
  /**
   * Bookings post to /api/bookings. Set this to a full https URL to send
   * the same JSON payload to an external form endpoint instead.
   */
  formEndpoint: "[FORM ENDPOINT]",
  inquiryEndpoint: "[FORM ENDPOINT]",
} as const;

/** Staff board key. Set DESK_KEY in the environment to replace the demo default. */
export const DESK_KEY_DEFAULT = "bench";

/** Stand-in weekly hours. Index 0 is Sunday. null = closed. */
export const placeholderSchedule: ({ open: string; close: string } | null)[] = [
  null,
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
  { open: "09:00", close: "18:00" },
];

export const SLOT_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export const SLOT_CAPACITY = 3;

export const STATUS_FLOW = [
  { id: "received", label: "Received", detail: "Booking is in. We are expecting the phone." },
  { id: "diagnosing", label: "Diagnosing", detail: "The phone is on the bench and we are finding the fault." },
  { id: "in_repair", label: "In repair", detail: "Work is underway." },
  { id: "ready", label: "Ready for pickup", detail: "It is ready to collect. Pickup jobs: we confirm collection." },
] as const;

export type StatusId = (typeof STATUS_FLOW)[number]["id"];

export function formatSlot(slot: string) {
  const [hRaw, mRaw] = slot.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return slot;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatClock(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return formatSlot(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

export type OpenState = {
  open: boolean;
  label: string;
  detail: string;
};

export function getOpenState(now = new Date()): OpenState {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = placeholderSchedule[day];

  if (today) {
    const [oh, om] = today.open.split(":").map(Number);
    const [ch, cm] = today.close.split(":").map(Number);
    const openM = oh * 60 + om;
    const closeM = ch * 60 + cm;
    if (minutes >= openM && minutes < closeM) {
      return {
        open: true,
        label: "Open now",
        detail: `Placeholder schedule. Closes at ${formatSlot(today.close)}. Published hours: ${site.hours}.`,
      };
    }
    if (minutes < openM) {
      return {
        open: false,
        label: `Closed. Opens at ${formatSlot(today.open)}`,
        detail: `Placeholder schedule until ${site.hours} is set.`,
      };
    }
  }

  for (let i = 1; i <= 7; i += 1) {
    const next = placeholderSchedule[(day + i) % 7];
    if (next) {
      return {
        open: false,
        label: `Closed. Opens at ${formatSlot(next.open)}`,
        detail: `Placeholder schedule until ${site.hours} is set.`,
      };
    }
  }

  return {
    open: false,
    label: `Closed. Opens at ${site.hours}`,
    detail: "Set placeholderSchedule in src/lib/site.ts.",
  };
}

export function whatsappUrl(text: string) {
  const encoded = encodeURIComponent(text);
  if (site.whatsappLink.startsWith("http")) {
    const join = site.whatsappLink.includes("?") ? "&" : "?";
    return `${site.whatsappLink}${join}text=${encoded}`;
  }
  const digits = site.whatsappNumber.replace(/\D/g, "");
  if (digits.length >= 8) return `https://wa.me/${digits}?text=${encoded}`;
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function bookingMessage(input: {
  reference: string;
  brand: string;
  model: string;
  service: string;
  issue: string;
  date: string;
  slot: string;
  fulfillment: string;
  name: string;
  phone: string;
}) {
  return [
    "Hello Ultimate GSM, I booked a repair on the website.",
    `Reference: ${input.reference}`,
    `Device: ${input.brand} ${input.model}`,
    `Service: ${input.service}`,
    `Issue: ${input.issue}`,
    `When: ${input.date} at ${formatSlot(input.slot)}`,
    `Handover: ${input.fulfillment === "pickup" ? "Pickup" : "Drop-off"}`,
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
  ].join("\n");
}
