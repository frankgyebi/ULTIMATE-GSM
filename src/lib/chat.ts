import { site } from "@/lib/site";

export type ChatLink = { href: string; label: string };

export type ChatReply = {
  text: string;
  links?: ChatLink[];
  handoff?: boolean;
};

const pricing: ChatReply = {
  text: "We confirm the cost after a quick look — every fault is a little different, so I will not invent a price here. Price: [PLACEHOLDER]. I can start a booking, or hand this chat to WhatsApp.",
  links: [
    { href: "/book", label: "Book a repair" },
    { href: "/services", label: "See services" },
  ],
  handoff: true,
};

const hours: ChatReply = {
  text: `Published hours are still ${site.hours}. The badge in the menu uses a stand-in schedule (Mon–Sat 9:00 AM–6:00 PM, Sunday closed) until the real hours are connected.`,
  links: [{ href: "/contact", label: "Contact page" }],
};

const track: ChatReply = {
  text: "Track a repair with the reference from your confirmation. It looks like UGSM-1001. Sample tickets UGSM-1001 to UGSM-1004 are placeholder records in the database.",
  links: [{ href: "/track", label: "Open the tracker" }],
};

const accessories: ChatReply = {
  text: "The Ultimate GSM Store curates Oraimo chargers, power banks, data cables, wireless audio, and car chargers. Product price and stock stay live on the official Oraimo Ghana page.",
  links: [{ href: "/store", label: "Browse the store" }],
};

const handoff: ChatReply = {
  text: "I can pass this chat to a technician on WhatsApp. The button below includes the conversation so you do not have to repeat it.",
  handoff: true,
};

const unlock: ChatReply = {
  text: "We can look at FRP or iCloud locks for a phone you own, but I do not share bypass steps in chat. Book a look and we will confirm the model and the lock type first.",
  links: [{ href: "/book?service=frp-icloud&fresh=1", label: "Start this repair" }],
  handoff: true,
};

export function replyTo(raw: string): ChatReply {
  const q = raw.toLowerCase();

  if (/pric|cost|how much|quote|fee|charge me/.test(q)) return pricing;
  if (/hour|open|close|when are you|what time/.test(q)) return hours;
  if (/track|reference|ugsm-|status of|where is my/.test(q)) return track;
  if (/accessor|oraimo|charger|power bank|earphone|headphone|cable|in stock/.test(q)) return accessories;
  if (/technician|human|person|agent|talk to|someone/.test(q)) return handoff;
  if (/icloud|frp|bypass|unlock/.test(q)) return unlock;
  if (/address|where are you|location|directions/.test(q)) {
    return {
      text: `The shop address is ${site.address}. Drop-off is at the bench. Pickup is confirmed when we call ${site.phone}.`,
      links: [{ href: "/contact", label: "Contact details" }],
    };
  }
  if (/book|appoint|repair|drop.?off|pickup/.test(q)) {
    return {
      text: "The booking wizard takes about a minute. You can leave and come back — it saves on this phone.",
      links: [{ href: "/book", label: "Book a repair" }],
    };
  }
  if (/screen|battery|water|motherboard|charging|reball|software/.test(q)) {
    return {
      text: "We cover screen, battery, water damage, charging, software unlock, IC reballing, motherboard work, and FRP/iCloud for a device you own. Turnaround is [PLACEHOLDER] until we see the phone.",
      links: [{ href: "/services", label: "Service details" }, { href: "/book", label: "Book a repair" }],
    };
  }
  if (/warranty|guarantee/.test(q)) {
    return {
      text: "Warranty terms are [PLACEHOLDER]. We confirm them with the job, not in this chat.",
      handoff: true,
    };
  }

  return {
    text: "I do not have a sure answer for that. A technician can take it from here — I will include this chat in the WhatsApp message.",
    handoff: true,
    links: [{ href: "/contact", label: "Contact page" }],
  };
}

export const quickReplies = [
  { id: "pricing", label: "Pricing", message: "Can you tell me about pricing?" },
  { id: "track", label: "Track my repair", message: "I want to track my repair." },
  { id: "hours", label: "Opening hours", message: "What are your opening hours?" },
  { id: "accessories", label: "Store", message: "What products are in the store?" },
  { id: "tech", label: "Talk to a technician", message: "I want to talk to a technician." },
] as const;
