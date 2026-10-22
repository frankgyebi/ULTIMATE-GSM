import { slotCounts } from "@/lib/tickets";
import { SLOT_CAPACITY, SLOT_TIMES, formatSlot, placeholderSchedule } from "@/lib/site";
import { isYmd, parseYmd, todayYmd } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!isYmd(date)) {
    return Response.json({ ok: false, error: "Pick a valid date." }, { status: 400 });
  }

  const day = parseYmd(date).getDay();
  const hours = placeholderSchedule[day];
  if (!hours) {
    return Response.json({
      ok: true,
      date,
      closed: true,
      slots: [],
      note: "Closed on the placeholder schedule. Sunday is shut until real hours replace [HOURS].",
    });
  }

  if (date < todayYmd()) {
    return Response.json({ ok: false, error: "That date has passed." }, { status: 400 });
  }

  try {
    const counts = await slotCounts(date);
    const now = new Date();
    const isToday = date === todayYmd(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slots = SLOT_TIMES.map((time) => {
      const [h, m] = time.split(":").map(Number);
      const passed = isToday && h * 60 + m <= nowMinutes;
      const taken = counts[time] ?? 0;
      const full = taken >= SLOT_CAPACITY;
      return {
        time,
        label: formatSlot(time),
        available: !passed && !full,
        reason: passed ? "Passed" : full ? "Full" : "Open",
        remaining: Math.max(0, SLOT_CAPACITY - taken),
      };
    });

    return Response.json(
      {
        ok: true,
        date,
        closed: false,
        slots,
        note: "Slots come from live bookings in the database. Capacity is a placeholder setting.",
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ ok: false, error: "Could not load slots." }, { status: 500 });
  }
}
