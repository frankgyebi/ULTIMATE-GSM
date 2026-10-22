import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { repairRequests, statusEvents } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { serviceById } from "@/lib/catalog";
import { STATUS_FLOW, type StatusId } from "@/lib/site";

export type PublicTicket = {
  reference: string;
  status: StatusId;
  isSample: boolean;
  brand: string;
  model: string;
  serviceId: string;
  serviceName: string;
  fulfillment: string;
  preferredDate: string;
  timeSlot: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  events: { status: string; note: string | null; at: string }[];
  stages: { id: string; label: string; detail: string; state: "done" | "current" | "upcoming" }[];
  note: string;
};

function maskName(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? "Customer";
  return first;
}

export function buildStages(status: string) {
  const index = STATUS_FLOW.findIndex((item) => item.id === status);
  const current = index < 0 ? 0 : index;
  return STATUS_FLOW.map((item, i) => ({
    id: item.id,
    label: item.label,
    detail: item.detail,
    state: i < current ? ("done" as const) : i === current ? ("current" as const) : ("upcoming" as const),
  }));
}

export async function getTicket(reference: string): Promise<PublicTicket | null> {
  await ensureSeed();
  const ref = reference.trim().toUpperCase();
  const [row] = await db.select().from(repairRequests).where(eq(repairRequests.reference, ref)).limit(1);
  if (!row) return null;

  const events = await db
    .select()
    .from(statusEvents)
    .where(eq(statusEvents.requestId, row.id))
    .orderBy(statusEvents.createdAt);

  return {
    reference: row.reference,
    status: (STATUS_FLOW.some((item) => item.id === row.status) ? row.status : "received") as StatusId,
    isSample: row.isSample,
    brand: row.brand,
    model: row.model,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    fulfillment: row.fulfillment,
    preferredDate: row.preferredDate,
    timeSlot: row.timeSlot,
    customerName: maskName(row.customerName),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    events: events.map((event) => ({
      status: event.status,
      note: event.note,
      at: event.createdAt.toISOString(),
    })),
    stages: buildStages(row.status),
    note: row.isSample
      ? "This is a placeholder sample stored in the database so you can try the tracker. Live bookings you submit use the same timeline."
      : "Status is read live from the shop database.",
  };
}

export async function slotCounts(date: string) {
  await ensureSeed();
  const rows = await db
    .select({
      timeSlot: repairRequests.timeSlot,
      count: sql<number>`count(*)::int`,
    })
    .from(repairRequests)
    .where(eq(repairRequests.preferredDate, date))
    .groupBy(repairRequests.timeSlot);

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.timeSlot] = Number(row.count);
  return counts;
}

export function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 4; i += 1) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `UGSM-${body}`;
}

export async function createBooking(input: {
  brand: string;
  model: string;
  serviceId: string;
  chips: string[];
  description: string;
  customerName: string;
  phone: string;
  email: string | null;
  contactMethod: string;
  fulfillment: string;
  preferredDate: string;
  timeSlot: string;
}) {
  await ensureSeed();
  const service = serviceById(input.serviceId);
  if (!service) throw new Error("Unknown service");

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const reference = makeReference();
    try {
      const [row] = await db
        .insert(repairRequests)
        .values({
          reference,
          brand: input.brand,
          model: input.model,
          serviceId: service.id,
          serviceName: service.name,
          chips: JSON.stringify(input.chips),
          description: input.description,
          customerName: input.customerName,
          phone: input.phone,
          email: input.email,
          contactMethod: input.contactMethod,
          fulfillment: input.fulfillment,
          preferredDate: input.preferredDate,
          timeSlot: input.timeSlot,
          consent: true,
          status: "received",
          isSample: false,
        })
        .returning();

      await db.insert(statusEvents).values({
        requestId: row.id,
        status: "received",
        note: "Booking received from the website.",
      });

      return row;
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code === "23505") continue;
      throw error;
    }
  }
  throw new Error("Could not create a reference. Try again.");
}

export async function listDesk() {
  await ensureSeed();
  const rows = await db.select().from(repairRequests).orderBy(sql`${repairRequests.createdAt} desc`);
  return rows.map((row) => ({
    reference: row.reference,
    brand: row.brand,
    model: row.model,
    serviceName: row.serviceName,
    customerName: row.customerName,
    phone: row.phone,
    fulfillment: row.fulfillment,
    preferredDate: row.preferredDate,
    timeSlot: row.timeSlot,
    status: row.status,
    isSample: row.isSample,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function updateStatus(reference: string, status: StatusId, note?: string) {
  await ensureSeed();
  const [row] = await db
    .select()
    .from(repairRequests)
    .where(eq(repairRequests.reference, reference.trim().toUpperCase()))
    .limit(1);
  if (!row) return null;

  const now = new Date();
  await db
    .update(repairRequests)
    .set({ status, updatedAt: now })
    .where(and(eq(repairRequests.id, row.id)));

  await db.insert(statusEvents).values({
    requestId: row.id,
    status,
    note: note?.trim() || `Status set to ${status.replace("_", " ")} from the bench board.`,
    createdAt: now,
  });

  return getTicket(row.reference);
}
