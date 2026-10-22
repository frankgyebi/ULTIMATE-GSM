"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "repairs completed", hint: "Placeholder stat" },
  { label: "phones welcomed back", hint: "Placeholder stat" },
  { label: "accessory lines", hint: "Placeholder stat" },
];

function Stat({ label, hint }: { label: string; hint: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("[X]");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (reduced) {
        setText("[X]");
        return;
      }
      let ticks = 0;
      timer = window.setInterval(() => {
        ticks += 1;
        setText(String(120 + ((ticks * 47) % 860)));
        if (ticks > 16) {
          window.clearInterval(timer);
          setText("[X]");
        }
      }, 55);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="stat" ref={ref}>
      <strong aria-hidden="true">{text}</strong>
      <span className="sr-only">[X] placeholder</span>
      <span>{label}</span>
      <small>{hint}</small>
    </div>
  );
}

export function Counters() {
  return (
    <div className="stat-grid" aria-label="Placeholder shop stats">
      {stats.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </div>
  );
}
