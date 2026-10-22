"use client";

import { useState } from "react";
import { site, whatsappUrl } from "@/lib/site";
import { emailError, nameError, phoneError } from "@/lib/validate";

const topics = ["Repair question", "Accessory question", "Pickup", "Something else"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const issue = nameError(name) || phoneError(phone) || emailError(email) || (message.trim().length < 8 ? "Add a short message." : null);
    if (issue) {
      setError(issue);
      return;
    }
    setSending(true);
    setError("");
    const endpoint = site.inquiryEndpoint.startsWith("http") ? site.inquiryEndpoint : "/api/inquiries";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, email, topic, message }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not send the message.");
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="form-card" role="status">
        <h2>Message received.</h2>
        <p className="muted">We stored it with the shop records. If it is urgent, use WhatsApp {site.whatsappLink}.</p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <h2 style={{ marginBottom: 8 }}>Send a note</h2>
      <p className="faint">This posts to {site.inquiryEndpoint === "[FORM ENDPOINT]" ? "/api/inquiries" : site.inquiryEndpoint}. Replace [FORM ENDPOINT] to send elsewhere.</p>
      <label className="field">
        <span>Name</span>
        <input value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Phone</span>
        <input value={phone} autoComplete="tel" inputMode="tel" onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label className="field">
        <span>Email, optional</span>
        <input value={email} autoComplete="email" inputMode="email" onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="field">
        <span>Topic</span>
        <select value={topic} onChange={(event) => setTopic(event.target.value)}>
          {topics.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Message</span>
        <textarea value={message} maxLength={1000} onChange={(event) => setMessage(event.target.value)} />
      </label>
      {error ? <p className="err" role="alert">{error}</p> : null}
      <div className="hero-actions">
        <button type="submit" className="btn btn-orange ripple" disabled={sending}>
          {sending ? "Sending…" : "Send message"}
        </button>
        <a className="btn btn-ghost ripple" href={whatsappUrl("Hello Ultimate GSM, I have a question.")} target="_blank" rel="noopener noreferrer">
          WhatsApp instead
        </a>
      </div>
    </form>
  );
}
