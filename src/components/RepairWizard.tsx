"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ServiceIcon } from "@/components/Logo";
import { brandById, brands, needsCustomModel, notSureService, problemChips, serviceById, services } from "@/lib/catalog";
import { bookingMessage, formatSlot, placeholderSchedule, site, whatsappUrl } from "@/lib/site";
import { emailError, isYmd, nameError, phoneError, todayYmd } from "@/lib/validate";

const DRAFT_KEY = "ugsm-repair-draft";
const CONFIRM_KEY = "ugsm-confirmation";
const STEP_TITLES = [
  "Choose a device",
  "Choose a service",
  "Describe the problem",
  "Contact details",
  "Drop-off or pickup",
  "Review",
];

type ContactMethod = "whatsapp" | "call" | "sms" | "";
type Fulfillment = "dropoff" | "pickup" | "";

type Draft = {
  step: number;
  maxReached: number;
  brandId: string;
  model: string;
  customModel: string;
  serviceId: string;
  chips: string[];
  description: string;
  name: string;
  phone: string;
  email: string;
  contactMethod: ContactMethod;
  fulfillment: Fulfillment;
  date: string;
  slot: string;
  consent: boolean;
};

type Slot = { time: string; label: string; available: boolean; reason: string };

type Confirmation = {
  reference: string;
  brand: string;
  model: string;
  serviceName: string;
  issue: string;
  date: string;
  slot: string;
  fulfillment: Fulfillment;
  name: string;
  phone: string;
};

const emptyDraft = (): Draft => ({
  step: 1,
  maxReached: 1,
  brandId: "",
  model: "",
  customModel: "",
  serviceId: "",
  chips: [],
  description: "",
  name: "",
  phone: "",
  email: "",
  contactMethod: "whatsapp",
  fulfillment: "",
  date: "",
  slot: "",
  consent: false,
});

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function RepairWizard() {
  const params = useSearchParams();
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsNote, setSlotsNote] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [closedDay, setClosedDay] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });

  const fresh = params.get("fresh");
  const serviceParam = params.get("service") ?? "";
  const done = params.get("done");

  useEffect(() => {
    const isFresh = fresh === "1";
    const service = serviceParam;

    if (done) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(CONFIRM_KEY) || "null") as Confirmation | null;
        if (saved?.reference === done) {
          setConfirmation(saved);
          setReady(true);
          return;
        }
      } catch {
        /* ignore */
      }
    }

    if (!isFresh) {
      try {
        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") as Draft | null;
        if (saved?.brandId || saved?.serviceId || saved?.name || saved?.description) {
          setDraft({ ...emptyDraft(), ...saved, chips: saved.chips ?? [] });
          setBanner("Picked up where you left off.");
          setReady(true);
          return;
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }

    const next = emptyDraft();
    if (serviceById(service)) {
      next.serviceId = service;
      setBanner(`${serviceById(service)?.name} is selected. Choose the phone first.`);
    }
    setDraft(next);
    setReady(true);
  }, [fresh, serviceParam, done]);

  useEffect(() => {
    if (!ready || confirmation) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, ready, confirmation]);

  useEffect(() => {
    headingRef.current?.focus();
    setAnnounce(`Step ${draft.step} of 6: ${STEP_TITLES[draft.step - 1]}`);
  }, [draft.step]);

  useEffect(() => {
    if (!draft.date) {
      setSlots([]);
      setClosedDay(false);
      return;
    }
    const controller = new AbortController();
    setSlotsLoading(true);
    fetch(`/api/slots?date=${encodeURIComponent(draft.date)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: { ok: boolean; slots?: Slot[]; closed?: boolean; note?: string; error?: string }) => {
        if (!payload.ok) {
          setError(payload.error || "Could not load times.");
          setSlots([]);
          return;
        }
        setClosedDay(Boolean(payload.closed));
        setSlots(payload.slots ?? []);
        setSlotsNote(payload.note ?? "");
        setDraft((current) => {
          if (!current.slot) return current;
          const stillOpen = (payload.slots ?? []).some((slot) => slot.time === current.slot && slot.available);
          return stillOpen ? current : { ...current, slot: "" };
        });
      })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name === "AbortError") return;
        setError("Could not load times. Check the connection and try the date again.");
      })
      .finally(() => setSlotsLoading(false));
    return () => controller.abort();
  }, [draft.date]);

  const brand = brandById(draft.brandId);
  const service = serviceById(draft.serviceId);
  const modelLabel = needsCustomModel(draft.model) && draft.customModel ? draft.customModel : draft.model;
  const nameIssue = touched.name || draft.name ? nameError(draft.name) : null;
  const phoneIssue = touched.phone || draft.phone ? phoneError(draft.phone) : null;
  const emailIssue = draft.email ? emailError(draft.email) : null;

  const calendar = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1).getDay();
    const count = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i += 1) cells.push(null);
    for (let day = 1; day <= count; day += 1) cells.push(day);
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [cursor]);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setError("");
  }

  function go(step: number, direction: "next" | "prev" = step > draft.step ? "next" : "prev") {
    setDir(direction);
    setDraft((current) => ({
      ...current,
      step,
      maxReached: Math.max(current.maxReached, step),
    }));
    setError("");
  }

  function validate(step: number) {
    if (step === 1) {
      if (!brand) return "Choose a phone brand.";
      if (!draft.model) return "Choose a model.";
      if (needsCustomModel(draft.model) && draft.customModel.trim().length < 2) return "Add the model name.";
    }
    if (step === 2 && !service) return "Choose a service, or tap Not sure.";
    if (step === 3 && draft.chips.length === 0 && draft.description.trim().length < 8) {
      return "Tap a problem, or add a short note.";
    }
    if (step === 4) {
      setTouched({ name: true, phone: true, email: true });
      return nameError(draft.name) || phoneError(draft.phone) || emailError(draft.email) || (!draft.contactMethod ? "Choose how we should reach you." : null);
    }
    if (step === 5) {
      if (!draft.fulfillment) return "Choose drop-off or pickup.";
      if (!draft.date) return "Pick a date.";
      if (closedDay) return "That day is closed on the placeholder schedule.";
      if (!draft.slot) return "Pick an open time.";
    }
    if (step === 6 && !draft.consent) return "Tick the consent box to book.";
    return null;
  }

  function next() {
    const issue = validate(draft.step);
    if (issue) {
      setError(issue);
      setAnnounce(issue);
      return;
    }
    go(Math.min(6, draft.step + 1), "next");
  }

  async function submit() {
    const issue = validate(6) || validate(5) || validate(4) || validate(3) || validate(2) || validate(1);
    if (issue) {
      setError(issue);
      setAnnounce(issue);
      return;
    }
    setSubmitting(true);
    setError("");
    const payload = {
      brandId: draft.brandId,
      model: draft.model,
      customModel: draft.customModel,
      serviceId: draft.serviceId,
      chips: draft.chips,
      description: draft.description,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      contactMethod: draft.contactMethod,
      fulfillment: draft.fulfillment,
      date: draft.date,
      slot: draft.slot,
      consent: true,
    };
    const endpoint = site.formEndpoint.startsWith("http") ? site.formEndpoint : "/api/bookings";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; reference?: string; serviceName?: string; brand?: string; model?: string };
      if (!response.ok || !data.ok || !data.reference) {
        throw new Error(data.error || "Could not save the booking.");
      }
      const confirmed: Confirmation = {
        reference: data.reference,
        brand: data.brand || brand?.name || "",
        model: data.model || modelLabel,
        serviceName: data.serviceName || service?.name || "",
        issue: [...draft.chips, draft.description.trim()].filter(Boolean).join(". "),
        date: draft.date,
        slot: draft.slot,
        fulfillment: draft.fulfillment,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
      };
      sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(confirmed));
      localStorage.removeItem(DRAFT_KEY);
      setConfirmation(confirmed);
      setAnnounce(`Booking saved. Reference ${confirmed.reference}.`);
      router.replace(`/book?done=${confirmed.reference}`, { scroll: false });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not save the booking.";
      setError(message);
      setAnnounce(message);
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    localStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(CONFIRM_KEY);
    setConfirmation(null);
    setBanner("");
    setDraft(emptyDraft());
    router.replace("/book", { scroll: false });
  }

  async function copyRef() {
    if (!confirmation) return;
    try {
      await navigator.clipboard.writeText(confirmation.reference);
      setCopied(true);
      setAnnounce("Reference copied.");
    } catch {
      setCopied(false);
      setAnnounce("Could not copy. Select the reference and copy it.");
    }
  }

  const today = todayYmd();
  const progress = confirmation ? 100 : Math.round((draft.step / 6) * 100);

  if (!ready) {
    return (
      <div className="wrap wizard">
        <p>Loading your booking…</p>
      </div>
    );
  }

  if (confirmation) {
    const message = bookingMessage({
      reference: confirmation.reference,
      brand: confirmation.brand,
      model: confirmation.model,
      service: confirmation.serviceName,
      issue: confirmation.issue,
      date: confirmation.date,
      slot: confirmation.slot,
      fulfillment: confirmation.fulfillment,
      name: confirmation.name,
      phone: confirmation.phone,
    });
    return (
      <div className="wrap wizard">
        <div className="wizard-card confirm" role="status">
          <svg className="check" viewBox="0 0 72 72" aria-hidden="true">
            <circle cx="36" cy="36" r="28" />
            <path d="M22 37.5 32 47.5 51 26" />
          </svg>
          <p className="kicker">Booked</p>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)" }}>You are on the bench list.</h1>
          <p className="lede" style={{ marginInline: "auto" }}>
            Keep this reference. We will confirm on {site.phone}.
          </p>
          <p className="ref">{confirmation.reference}</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <button type="button" className="btn btn-ghost ripple" onClick={copyRef}>
              {copied ? "Copied" : "Copy reference"}
            </button>
            <a className="btn btn-orange ripple" href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
              Send via WhatsApp
            </a>
            <Link className="btn btn-blue ripple" href={`/track?ref=${confirmation.reference}`}>
              Track this repair
            </Link>
          </div>
          <p className="faint" style={{ marginTop: 16 }}>
            WhatsApp opens a pre-filled message. Shop link: {site.whatsappLink}. Form endpoint: {site.formEndpoint}.
          </p>
          <button type="button" className="text-btn" onClick={startOver}>
            Book another repair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap wizard">
      <div className="page-hero" style={{ paddingTop: 18 }}>
        <p className="kicker">Book a repair</p>
        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.4rem)" }}>Tell us the phone.</h1>
        <p className="lede">Six short steps. Leave and come back — this phone remembers the draft.</p>
      </div>
      <div className="wizard-card">
        <div className="sr-only" aria-live="polite">
          {announce}
        </div>
        {banner ? (
          <div className="resume">
            <p style={{ margin: 0 }}>{banner}</p>
            <button type="button" className="text-btn" onClick={startOver}>
              Start over
            </button>
          </div>
        ) : null}
        <div className="progress-top">
          <p id="step-label">
            Step {draft.step} of 6 · {STEP_TITLES[draft.step - 1]}
          </p>
          <p>{progress}%</p>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={6}
          aria-valuenow={draft.step}
          aria-valuetext={`Step ${draft.step} of 6, ${STEP_TITLES[draft.step - 1]}`}
          aria-labelledby="step-label"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <ol className="step-dots">
          {STEP_TITLES.map((title, index) => {
            const number = index + 1;
            return (
              <li key={title}>
                <button
                  type="button"
                  aria-current={draft.step === number ? "step" : undefined}
                  aria-label={`Go to step ${number}: ${title}`}
                  disabled={number > draft.maxReached}
                  onClick={() => go(number)}
                >
                  {number}
                  <span className="sr-only">{title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className={`step-panel ${dir}`} key={draft.step}>
          <h2 tabIndex={-1} ref={headingRef} style={{ marginBottom: 14 }}>
            {STEP_TITLES[draft.step - 1]}
          </h2>

          {draft.step === 1 ? (
            <>
              <div className="choice-grid" role="group" aria-label="Phone brand">
                {brands.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="choice"
                    aria-pressed={draft.brandId === item.id}
                    onClick={() => patch({ brandId: item.id, model: "", customModel: "" })}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {brand ? (
                <label className="field" style={{ marginTop: 16 }}>
                  <span>Model</span>
                  <select
                    value={draft.model}
                    onChange={(event) => patch({ model: event.target.value, customModel: "" })}
                  >
                    <option value="">Select a model</option>
                    {brand.models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {needsCustomModel(draft.model) ? (
                <label className="field">
                  <span>Model name</span>
                  <input
                    value={draft.customModel}
                    onChange={(event) => patch({ customModel: event.target.value })}
                    placeholder="Type the model"
                    autoComplete="off"
                  />
                </label>
              ) : null}
            </>
          ) : null}

          {draft.step === 2 ? (
            <div className="choice-grid services">
              {[...services, notSureService].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="choice"
                  aria-pressed={draft.serviceId === item.id}
                  onClick={() => patch({ serviceId: item.id })}
                >
                  <span className="icon-blob" aria-hidden="true">
                    <ServiceIcon name={item.icon} />
                  </span>
                  {item.name}
                  <small>{item.short}</small>
                </button>
              ))}
            </div>
          ) : null}

          {draft.step === 3 ? (
            <>
              <p className="muted">Tap anything that fits. Add a note if you want.</p>
              <div className="chips" role="group" aria-label="Common problems">
                {problemChips.map((chip) => {
                  const on = draft.chips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      className="chip"
                      aria-pressed={on}
                      onClick={() =>
                        patch({
                          chips: on ? draft.chips.filter((item) => item !== chip) : [...draft.chips, chip],
                        })
                      }
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <label className="field" style={{ marginTop: 16 }}>
                <span>What is the phone doing?</span>
                <textarea
                  value={draft.description}
                  maxLength={800}
                  onChange={(event) => patch({ description: event.target.value })}
                  placeholder="Example: dropped it, top half of the screen is black."
                />
              </label>
            </>
          ) : null}

          {draft.step === 4 ? (
            <>
              <label className="field">
                <span>Name</span>
                <input
                  value={draft.name}
                  autoComplete="name"
                  aria-invalid={Boolean(nameIssue)}
                  aria-describedby="name-error"
                  onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                  onChange={(event) => patch({ name: event.target.value })}
                />
                <p className="err" id="name-error">
                  {nameIssue || ""}
                </p>
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  value={draft.phone}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={Boolean(phoneIssue)}
                  aria-describedby="phone-error"
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  onChange={(event) => patch({ phone: event.target.value })}
                />
                <p className="err" id="phone-error">
                  {phoneIssue || ""}
                </p>
              </label>
              <label className="field">
                <span>Email, optional</span>
                <input
                  value={draft.email}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={Boolean(emailIssue)}
                  aria-describedby="email-error"
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  onChange={(event) => patch({ email: event.target.value })}
                />
                <p className="err" id="email-error">
                  {emailIssue || ""}
                </p>
              </label>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 700, marginBottom: 8 }}>Preferred contact</legend>
                <div className="seg">
                  {(
                    [
                      ["whatsapp", "WhatsApp"],
                      ["call", "Phone call"],
                      ["sms", "SMS"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className="chip"
                      aria-pressed={draft.contactMethod === id}
                      onClick={() => patch({ contactMethod: id })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}

          {draft.step === 5 ? (
            <>
              <div className="choice-grid">
                <button type="button" className="choice" aria-pressed={draft.fulfillment === "dropoff"} onClick={() => patch({ fulfillment: "dropoff" })}>
                  Drop-off
                  <small>Bring it to the bench at {site.address}.</small>
                </button>
                <button type="button" className="choice" aria-pressed={draft.fulfillment === "pickup"} onClick={() => patch({ fulfillment: "pickup" })}>
                  Pickup
                  <small>We collect. We confirm the area when we call.</small>
                </button>
              </div>
              <div className="split" style={{ marginTop: 18 }}>
                <div className="cal" aria-label="Choose a date">
                  <div className="cal-nav">
                    <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => setCursor((current) => {
                      const date = new Date(current.year, current.month - 1, 1);
                      return { year: date.getFullYear(), month: date.getMonth() };
                    })}>
                      ‹
                    </button>
                    <strong>{monthLabel(cursor.year, cursor.month)}</strong>
                    <button type="button" className="icon-btn" aria-label="Next month" onClick={() => setCursor((current) => {
                      const date = new Date(current.year, current.month + 1, 1);
                      return { year: date.getFullYear(), month: date.getMonth() };
                    })}>
                      ›
                    </button>
                  </div>
                  <div className="cal-head" aria-hidden="true">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="cal-grid" role="grid">
                    {calendar.map((day, index) => {
                      if (!day) return <span key={`e-${index}`} />;
                      const value = ymd(cursor.year, cursor.month, day);
                      const date = new Date(cursor.year, cursor.month, day);
                      const past = value < today;
                      const closed = !placeholderSchedule[date.getDay()];
                      const disabled = past || closed;
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`cal-day${value === today ? " today" : ""}`}
                          disabled={disabled}
                          aria-pressed={draft.date === value}
                          aria-label={`${value}${closed ? ", closed" : ""}${past ? ", past" : ""}`}
                          onClick={() => patch({ date: value, slot: "" })}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <p className="faint" style={{ margin: 0 }}>Past dates and Sundays are off. Sunday hours are a placeholder.</p>
                </div>
                <div>
                  <p style={{ marginTop: 0, fontWeight: 700 }}>Available times</p>
                  {slotsLoading ? <p>Checking the bench calendar…</p> : null}
                  {closedDay ? <p className="note">Closed that day on the placeholder schedule.</p> : null}
                  {!draft.date ? <p className="muted">Pick a date to see open slots.</p> : null}
                  <div className="slots" role="group" aria-label="Time slots">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className="slot"
                        disabled={!slot.available}
                        aria-pressed={draft.slot === slot.time}
                        onClick={() => patch({ slot: slot.time })}
                      >
                        {slot.label}
                        <small>{slot.reason}</small>
                      </button>
                    ))}
                  </div>
                  {slotsNote ? <p className="faint">{slotsNote}</p> : null}
                </div>
              </div>
            </>
          ) : null}

          {draft.step === 6 ? (
            <>
              <div className="ticket">
                <div className="ticket-row">
                  <div>
                    <strong>Device</strong>
                    <p className="muted">{brand?.name} · {modelLabel}</p>
                  </div>
                  <button type="button" className="text-btn" onClick={() => go(1, "prev")}>Edit</button>
                </div>
                <div className="ticket-row">
                  <div>
                    <strong>Service</strong>
                    <p className="muted">{service?.name}</p>
                  </div>
                  <button type="button" className="text-btn" onClick={() => go(2, "prev")}>Edit</button>
                </div>
                <div className="ticket-row">
                  <div>
                    <strong>Problem</strong>
                    <p className="muted">{draft.chips.join(", ") || "No chips"}{draft.description ? ` — ${draft.description}` : ""}</p>
                  </div>
                  <button type="button" className="text-btn" onClick={() => go(3, "prev")}>Edit</button>
                </div>
                <div className="ticket-row">
                  <div>
                    <strong>Contact</strong>
                    <p className="muted">
                      {draft.name} · {draft.phone}
                      {draft.email ? ` · ${draft.email}` : ""} · {draft.contactMethod}
                    </p>
                  </div>
                  <button type="button" className="text-btn" onClick={() => go(4, "prev")}>Edit</button>
                </div>
                <div className="ticket-row">
                  <div>
                    <strong>When</strong>
                    <p className="muted">
                      {draft.fulfillment === "pickup" ? "Pickup" : "Drop-off"} · {draft.date} · {draft.slot ? formatSlot(draft.slot) : ""}
                    </p>
                  </div>
                  <button type="button" className="text-btn" onClick={() => go(5, "prev")}>Edit</button>
                </div>
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={draft.consent}
                  onChange={(event) => patch({ consent: event.target.checked })}
                />
                <span>
                  I confirm I own this device or have permission to request this repair, and I agree to be contacted about this booking.
                </span>
              </label>
            </>
          ) : null}
        </div>

        {error ? (
          <p className="err" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        ) : null}
        <div className="wizard-actions">
          <button type="button" className="btn btn-ghost ripple" onClick={() => go(draft.step - 1, "prev")} disabled={draft.step === 1}>
            Back
          </button>
          {draft.step < 6 ? (
            <button type="button" className="btn btn-blue ripple" onClick={next}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn btn-orange ripple" onClick={submit} disabled={submitting}>
              {submitting ? "Saving…" : "Confirm booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
