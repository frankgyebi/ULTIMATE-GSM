import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { emailError, nameError, phoneError } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { name?: string; phone?: string; email?: string; topic?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Send the message as JSON." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().slice(0, 160);
  const topic = String(body.topic ?? "").trim().slice(0, 80);
  const message = String(body.message ?? "").trim().slice(0, 1000);

  const issue = nameError(name) || phoneError(phone) || emailError(email);
  if (issue) return Response.json({ ok: false, error: issue }, { status: 400 });
  if (topic.length < 2) return Response.json({ ok: false, error: "Choose a topic." }, { status: 400 });
  if (message.length < 8) return Response.json({ ok: false, error: "Add a short message." }, { status: 400 });

  try {
    const [row] = await db
      .insert(inquiries)
      .values({ name, phone, email: email || null, topic, message })
      .returning({ id: inquiries.id });
    return Response.json({ ok: true, id: row.id });
  } catch {
    return Response.json({ ok: false, error: "Could not save the message." }, { status: 500 });
  }
}
