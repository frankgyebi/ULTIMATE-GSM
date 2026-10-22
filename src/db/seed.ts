import { eq } from "drizzle-orm";
import { db } from "./index";
import { repairRequests, statusEvents } from "./schema";
import { todayYmd } from "@/lib/validate";

const SAMPLE_REFS = ["UGSM-1001", "UGSM-1002", "UGSM-1003", "UGSM-1004"] as const;

let seeded = false;
let inflight: Promise<void> | null = null;

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date;
}

function addDaysYmd(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return todayYmd(date);
}

export async function ensureSeed() {
  if (seeded) return;
  if (!inflight) {
    inflight = runSeed().finally(() => {
      inflight = null;
    });
  }
  await inflight;
}

async function runSeed() {
  const existing = await db
    .select({ id: repairRequests.id })
    .from(repairRequests)
    .where(eq(repairRequests.reference, SAMPLE_REFS[0]))
    .limit(1);

  if (existing.length > 0) {
    seeded = true;
    return;
  }

  const samples = [
    {
      reference: "UGSM-1001",
      brand: "Tecno",
      model: "Camon series",
      serviceId: "screen-repair",
      serviceName: "Screen repair",
      chips: JSON.stringify(["Cracked screen"]),
      description: "Glass is shattered. Touch still answers in the top corner.",
      customerName: "Adaeze",
      phone: "08000000001",
      email: null,
      contactMethod: "whatsapp",
      fulfillment: "dropoff",
      preferredDate: addDaysYmd(-3),
      timeSlot: "10:00",
      status: "received",
      createdAt: daysAgo(3),
      events: [{ status: "received", note: "Placeholder sample. Device checked in at the bench.", at: daysAgo(3) }],
    },
    {
      reference: "UGSM-1002",
      brand: "Samsung",
      model: "Galaxy A series",
      serviceId: "battery-replacement",
      serviceName: "Battery replacement",
      chips: JSON.stringify(["Battery drains fast"]),
      description: "Drops from 40% to off within an hour.",
      customerName: "Kwame",
      phone: "08000000002",
      email: null,
      contactMethod: "call",
      fulfillment: "dropoff",
      preferredDate: addDaysYmd(-2),
      timeSlot: "11:00",
      status: "diagnosing",
      createdAt: daysAgo(2),
      events: [
        { status: "received", note: "Placeholder sample. Booking received.", at: daysAgo(2) },
        { status: "diagnosing", note: "Opened for a look. No price is stored on this sample.", at: daysAgo(1) },
      ],
    },
    {
      reference: "UGSM-1003",
      brand: "Apple",
      model: "iPhone 13",
      serviceId: "water-damage",
      serviceName: "Water damage",
      chips: JSON.stringify(["Water damage", "Won't turn on"]),
      description: "Fell in water yesterday. No power since.",
      customerName: "Chioma",
      phone: "08000000003",
      email: null,
      contactMethod: "whatsapp",
      fulfillment: "pickup",
      preferredDate: addDaysYmd(-1),
      timeSlot: "14:00",
      status: "in_repair",
      createdAt: daysAgo(4),
      events: [
        { status: "received", note: "Placeholder sample. Collected for the bench.", at: daysAgo(4) },
        { status: "diagnosing", note: "Corrosion check started.", at: daysAgo(3) },
        { status: "in_repair", note: "Board cleaning in progress. Outcome still open.", at: daysAgo(1) },
      ],
    },
    {
      reference: "UGSM-1004",
      brand: "Infinix",
      model: "Hot series",
      serviceId: "charging",
      serviceName: "Charging issues",
      chips: JSON.stringify(["Won't charge"]),
      description: "Cable has to be held at an angle.",
      customerName: "Malik",
      phone: "08000000004",
      email: null,
      contactMethod: "sms",
      fulfillment: "dropoff",
      preferredDate: addDaysYmd(-5),
      timeSlot: "15:00",
      status: "ready",
      createdAt: daysAgo(6),
      events: [
        { status: "received", note: "Placeholder sample. Dropped off.", at: daysAgo(6) },
        { status: "diagnosing", note: "Port and charging path tested.", at: daysAgo(5) },
        { status: "in_repair", note: "Charging part replaced on this sample record.", at: daysAgo(4) },
        { status: "ready", note: "Marked ready for pickup. This is placeholder data.", at: daysAgo(2) },
      ],
    },
  ];

  for (const sample of samples) {
    const [row] = await db
      .insert(repairRequests)
      .values({
        reference: sample.reference,
        brand: sample.brand,
        model: sample.model,
        serviceId: sample.serviceId,
        serviceName: sample.serviceName,
        chips: sample.chips,
        description: sample.description,
        customerName: sample.customerName,
        phone: sample.phone,
        email: sample.email,
        contactMethod: sample.contactMethod,
        fulfillment: sample.fulfillment,
        preferredDate: sample.preferredDate,
        timeSlot: sample.timeSlot,
        consent: true,
        status: sample.status,
        isSample: true,
        createdAt: sample.createdAt,
        updatedAt: sample.events[sample.events.length - 1]?.at ?? sample.createdAt,
      })
      .onConflictDoNothing()
      .returning({ id: repairRequests.id });

    if (!row) continue;

    await db.insert(statusEvents).values(
      sample.events.map((event) => ({
        requestId: row.id,
        status: event.status,
        note: event.note,
        createdAt: event.at,
      })),
    );
  }

  seeded = true;
}
