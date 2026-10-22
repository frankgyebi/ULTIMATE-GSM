import { getTicket } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!/^UGSM-[A-Z0-9]{4}$/i.test(ref.trim())) {
    return Response.json(
      { ok: false, error: "Enter a reference like UGSM-1001." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const ticket = await getTicket(ref);
    if (!ticket) {
      return Response.json(
        { ok: false, error: "No repair found for that reference." },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(
      {
        ok: true,
        ticket,
        source: "Live status is read from the repair_requests table. Connect your shop system there, or update jobs on the bench board.",
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false, error: "The tracker could not reach the database." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
