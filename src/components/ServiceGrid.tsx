"use client";

import Link from "next/link";
import { useState } from "react";
import { ServiceIcon } from "@/components/Logo";
import { services, type Service } from "@/lib/catalog";

export function ServiceGrid({ items = services, compact = false }: { items?: Service[]; compact?: boolean }) {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <div className="service-grid">
      {items.map((service) => {
        const open = flipped === service.id;
        return (
          <article
            key={service.id}
            className={`flip lift${open ? " is-flipped" : ""}`}
            onMouseEnter={() => {
              if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setFlipped(service.id);
            }}
            onMouseLeave={() => {
              if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                setFlipped((current) => (current === service.id ? null : current));
              }
            }}
          >
            <div className="flip-inner">
              <div className="face front" inert={open ? true : undefined} aria-hidden={open}>
                <button
                  type="button"
                  className="flip-toggle"
                  aria-expanded={open}
                  onClick={() => setFlipped(open ? null : service.id)}
                >
                  <span className="icon-blob" aria-hidden="true">
                    <ServiceIcon name={service.icon} />
                  </span>
                  <h3>{service.name}</h3>
                  {!compact ? <p className="muted" style={{ margin: 0 }}>{service.short}</p> : null}
                  <span className="hint">Flip for details</span>
                </button>
              </div>
              <div className="face back" inert={open ? undefined : true} aria-hidden={!open}>
                <h3>{service.name}</h3>
                <p className="muted" style={{ margin: 0 }}>{service.involves}</p>
                <p className="turnaround">Typical turnaround: [PLACEHOLDER]</p>
                <Link className="btn btn-orange ripple" href={`/book?service=${service.id}&fresh=1`}>
                  Start this repair
                </Link>
                <button type="button" className="text-btn" onClick={() => setFlipped(null)}>
                  Flip back
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
