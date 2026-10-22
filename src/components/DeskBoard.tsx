"use client";

import { useState } from "react";
import { DESK_KEY_DEFAULT, STATUS_FLOW, formatSlot } from "@/lib/site";

type Job = {
  reference: string;
  brand: string;
  model: string;
  serviceName: string;
  customerName: string;
  phone: string;
  fulfillment: string;
  preferredDate: string;
  timeSlot: string;
  status: string;
  isSample: boolean;
};

export function DeskBoard() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [live, setLive] = useState("");

  async function load(nextKey = key) {
    setError("");
    const response = await fetch("/api/desk", { headers: { "x-desk-key": nextKey } });
    const data = (await response.json()) as { ok: boolean; jobs?: Job[]; error?: string };
    if (!response.ok || !data.ok || !data.jobs) {
      setAuthed(false);
      setError(data.error || "Could not open the board.");
      return;
    }
    setJobs(data.jobs);
    setAuthed(true);
    sessionStorage.setItem("ugsm-desk", nextKey);
  }

  async function setStatus(reference: string, status: string) {
    const response = await fetch("/api/desk", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-desk-key": key },
      body: JSON.stringify({ reference, status }),
    });
    const data = (await response.json()) as { ok: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setError(data.error || "Could not update status.");
      return;
    }
    setLive(`${reference} moved to ${status.replace(/_/g, " ")}.`);
    await load(key);
  }

  return (
    <div className="wrap" style={{ paddingBottom: 64, position: "relative", zIndex: 1 }}>
      <div className="page-hero">
        <p className="kicker">Staff</p>
        <h1>Bench board</h1>
        <p className="lede">Update a repair here and the public tracker reads the same database row.</p>
      </div>
      <div className="sr-only" aria-live="polite">{live}</div>
      {!authed ? (
        <form
          className="form-card"
          onSubmit={(event) => {
            event.preventDefault();
            void load(key);
          }}
        >
          <label className="field">
            <span>Staff key</span>
            <input value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" />
          </label>
          <p className="faint">Demo key: {DESK_KEY_DEFAULT}. Set DESK_KEY in the environment to replace it.</p>
          {error ? <p className="err" role="alert">{error}</p> : null}
          <button type="submit" className="btn btn-blue ripple">Open board</button>
        </form>
      ) : (
        <div className="desk-list">
          {error ? <p className="err" role="alert">{error}</p> : null}
          {jobs.map((job) => (
            <article key={job.reference} className="desk-card">
              <strong>{job.reference}</strong>
              <p className="muted" style={{ margin: 0 }}>
                {job.customerName} · {job.phone}
                <br />
                {job.brand} {job.model} · {job.serviceName}
                <br />
                {job.fulfillment} · {job.preferredDate} · {formatSlot(job.timeSlot)}
                {job.isSample ? " · placeholder sample" : ""}
              </p>
              <div className="status-pills" role="group" aria-label={`Status for ${job.reference}`}>
                {STATUS_FLOW.map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    className="chip"
                    aria-pressed={job.status === status.id}
                    onClick={() => void setStatus(job.reference, status.id)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
