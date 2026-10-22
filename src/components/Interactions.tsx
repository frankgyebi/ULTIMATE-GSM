"use client";

import { useEffect } from "react";

export function Interactions() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest(".ripple");
      if (!target || !(target instanceof HTMLElement)) return;
      const rect = target.getBoundingClientRect();
      const ink = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ink.className = "ripple-ink";
      ink.style.width = `${size}px`;
      ink.style.height = `${size}px`;
      ink.style.left = `${event.clientX - rect.left - size / 2}px`;
      ink.style.top = `${event.clientY - rect.top - size / 2}px`;
      target.appendChild(ink);
      window.setTimeout(() => ink.remove(), 600);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
