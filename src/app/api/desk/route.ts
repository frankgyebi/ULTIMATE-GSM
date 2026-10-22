import { DESK_KEY_DEFAULT } from "@/lib/site";
import { STATUS_FLOW, type StatusId } from "@/lib/site";
import { listDesk, updateStatus } from "@/lib/tickets";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = process.env.DESK_KEY || DESK_KEY_DEFAULT;
  const got = request.headers.get("x-desk-key") ?? "";
  return got.length > 0 && got === expected;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Staff key required." }, { status: 401 });
  }
  try {
    const jobs = await listDesk();
    return Response.json({ ok: true, jobs, statuses: STATUS_FLOW }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ok: false, error: "Could not load the bench board." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Staff key required." }, { status: 401 });
  }
  let body: { reference?: string; status?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Send JSON." }, { status: 400 });
  }
  const status = String(body.status ?? "");
  if (!STATUS_FLOW.some((item) => item.id === status)) {
    return Response.json({ ok: false, error: "Unknown status." }, { status: 400 });
  }
  try {
    const ticket = await updateStatus(String(body.reference ?? ""), status as StatusId, body.note);
    if (!ticket) return Response.json({ ok: false, error: "Repair not found." }, { status: 404 });
    return Response.json({ ok: true, ticket });
  } catch {
    return Response.json({ ok: false, error: "Could not update status." }, { status: 500 });
  }
}
