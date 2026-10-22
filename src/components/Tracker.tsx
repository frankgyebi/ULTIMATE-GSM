"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatSlot } from "@/lib/site";
import type { PublicTicket } from "@/lib/tickets";

const samples = ["UGSM-1001", "UGSM-1002", "UGSM-1003", "UGSM-1004"];

export function Tracker() {
  const params = useSearchParams();
  const [ref, setRef] = useState(params.get("ref")?.toUpperCase() ?? "");
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [live, setLive] = useState("");

  async function lookup(value = ref) {
    const clean = value.trim().toUpperCase();
    setRef(clean);
    if (!clean) {
      setError("Enter a reference like UGSM-1001.");
      setTicket(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/track?ref=${encodeURIComponent(clean)}`);
      const data = (await response.json()) as { ok: boolean; ticket?: PublicTicket; error?: string; source?: string };
      if (!response.ok || !data.ok || !data.ticket) {
        setTicket(null);
        setError(data.error || "No repair found for that reference.");
        setLive(data.error || "No repair found.");
        return;
      }
      setTicket(data.ticket);
      setSource(data.source || "");
      const current = data.ticket.stages.find((stage) => stage.state === "current");
      setLive(`${data.ticket.reference} is ${current?.label ?? data.ticket.status}.`);
    } catch {
      setError("The tracker could not reach the shop database.");
      setLive("Tracker unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = params.get("ref");
    if (initial) void lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wrap" style={{ paddingBottom: 56, position: "relative", zIndex: 1 }}>
      <div className="page-hero">
        <p className="kicker">Track my repair</p>
        <h1>Where is the phone?</h1>
        <p className="lede">Enter the reference from your confirmation. Status is read live from the shop database.</p>
      </div>
      <div className="callout" style={{ marginBottom: 18 }}>
        <strong>Connected to the backend. </strong>
        Sample tickets UGSM-1001 to UGSM-1004 are placeholder records so you can try the timeline. A booking you submit appears here with the same stages: Received, Diagnosing, In repair, Ready for pickup.
      </div>
      <form
        className="track-form"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <label className="sr-only" htmlFor="ref">
          Repair reference
        </label>
        <input
          id="ref"
          value={ref}
          onChange={(event) => setRef(event.target.value.toUpperCase())}
          placeholder="UGSM-1001"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="track-help"
        />
        <button type="submit" className="btn btn-orange ripple" disabled={loading}>
          {loading ? "Checking…" : "Track"}
        </button>
      </form>
      <p id="track-help" className="faint">Try a sample, or use the reference from your booking.</p>
      <div className="sample-row">
        {samples.map((sample) => (
          <button key={sample} type="button" className="chip" onClick={() => void lookup(sample)}>
            {sample}
          </button>
        ))}
      </div>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
      {error ? (
        <p className="err" role="alert" style={{ marginTop: 16 }}>
          {error}
        </p>
      ) : null}
      {ticket ? (
        <article className="wizard-card" style={{ marginTop: 22 }}>
          <p className="kicker">{ticket.isSample ? "Placeholder sample" : "Live booking"}</p>
          <h2 className="ref" style={{ textAlign: "left" }}>{ticket.reference}</h2>
          <p className="muted">
            {ticket.brand} {ticket.model} · {ticket.serviceName}
            <br />
            {ticket.fulfillment === "pickup" ? "Pickup" : "Drop-off"} · {ticket.preferredDate} · {formatSlot(ticket.timeSlot)}
            <br />
            Booked for {ticket.customerName}
          </p>
          <p className="note">{ticket.note}</p>
          <ol className="timeline">
            {ticket.stages.map((stage, index) => (
              <li key={stage.id} className={stage.state}>
                <div className="rail" aria-hidden="true">
                  <i />
                  {index < ticket.stages.length - 1 ? <b /> : null}
                </div>
                <article>
                  <h3>{stage.label}</h3>
                  <p className="muted" style={{ margin: "4px 0 0" }}>{stage.detail}</p>
                  {ticket.events
                    .filter((event) => event.status === stage.id)
                    .map((event) => (
                      <p key={`${event.status}-${event.at}`} className="faint" style={{ margin: "6px 0 0" }}>
                        {new Date(event.at).toLocaleString()} — {event.note}
                      </p>
                    ))}
                </article>
              </li>
            ))}
          </ol>
          {source ? <p className="faint">{source}</p> : null}
          <Link href="/book" className="btn btn-blue ripple">
            Book another repair
          </Link>
        </article>
      ) : null}
    </div>
  );
}
