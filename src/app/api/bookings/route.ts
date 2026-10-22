import { createBooking, slotCounts } from "@/lib/tickets";
import { brandById, needsCustomModel, serviceById } from "@/lib/catalog";
import { SLOT_CAPACITY, SLOT_TIMES, placeholderSchedule } from "@/lib/site";
import { emailError, isYmd, nameError, parseYmd, phoneError, todayYmd } from "@/lib/validate";

export const dynamic = "force-dynamic";

type Body = {
  brandId?: string;
  model?: string;
  customModel?: string;
  serviceId?: string;
  chips?: string[];
  description?: string;
  name?: string;
  phone?: string;
  email?: string;
  contactMethod?: string;
  fulfillment?: string;
  date?: string;
  slot?: string;
  consent?: boolean;
};

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Send the booking as JSON." }, { status: 400 });
  }

  const brand = brandById(clean(body.brandId, 40));
  const service = serviceById(clean(body.serviceId, 40));
  const modelPick = clean(body.model, 120);
  const customModel = clean(body.customModel, 120);
  const model = needsCustomModel(modelPick) && customModel ? customModel : modelPick;
  const chips = Array.isArray(body.chips) ? body.chips.map((chip) => clean(chip, 40)).filter(Boolean).slice(0, 8) : [];
  const description = clean(body.description, 800);
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 160);
  const contactMethod = clean(body.contactMethod, 20);
  const fulfillment = clean(body.fulfillment, 20);
  const date = clean(body.date, 12);
  const slot = clean(body.slot, 8);

  if (!brand || !brand.models.includes(modelPick)) {
    return Response.json({ ok: false, error: "Choose a phone brand and model." }, { status: 400 });
  }
  if (needsCustomModel(modelPick) && model.trim().length < 2) {
    return Response.json({ ok: false, error: "Add the model name." }, { status: 400 });
  }
  if (!service) {
    return Response.json({ ok: false, error: "Choose a service, or pick Not sure." }, { status: 400 });
  }
  if (chips.length === 0 && description.length < 8) {
    return Response.json({ ok: false, error: "Add a short note or tap a problem chip." }, { status: 400 });
  }
  const nameIssue = nameError(name);
  const phoneIssue = phoneError(phone);
  const emailIssue = emailError(email);
  if (nameIssue || phoneIssue || emailIssue) {
    return Response.json({ ok: false, error: nameIssue || phoneIssue || emailIssue }, { status: 400 });
  }
  if (!["whatsapp", "call", "sms"].includes(contactMethod)) {
    return Response.json({ ok: false, error: "Choose how we should reach you." }, { status: 400 });
  }
  if (!["dropoff", "pickup"].includes(fulfillment)) {
    return Response.json({ ok: false, error: "Choose drop-off or pickup." }, { status: 400 });
  }
  if (!isYmd(date) || date < todayYmd()) {
    return Response.json({ ok: false, error: "Pick a date that has not passed." }, { status: 400 });
  }
  if (!placeholderSchedule[parseYmd(date).getDay()]) {
    return Response.json({ ok: false, error: "That day is closed on the placeholder schedule." }, { status: 400 });
  }
  if (!SLOT_TIMES.includes(slot as (typeof SLOT_TIMES)[number])) {
    return Response.json({ ok: false, error: "Pick an open time slot." }, { status: 400 });
  }
  if (body.consent !== true) {
    return Response.json({ ok: false, error: "Consent is required before we can book this." }, { status: 400 });
  }

  const counts = await slotCounts(date);
  if ((counts[slot] ?? 0) >= SLOT_CAPACITY) {
    return Response.json({ ok: false, error: "That slot just filled. Pick another time." }, { status: 409 });
  }

  if (date === todayYmd()) {
    const [h, m] = slot.split(":").map(Number);
    const now = new Date();
    const slotMinutes = h * 60 + m;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (slotMinutes <= nowMinutes) {
      return Response.json({ ok: false, error: "That time has already passed today." }, { status: 400 });
    }
  }

  try {
    const row = await createBooking({
      brand: brand.name,
      model,
      serviceId: service.id,
      chips,
      description,
      customerName: name,
      phone,
      email: email || null,
      contactMethod,
      fulfillment,
      preferredDate: date,
      timeSlot: slot,
    });

    return Response.json({
      ok: true,
      reference: row.reference,
      serviceName: row.serviceName,
      brand: row.brand,
      model: row.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the booking.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
