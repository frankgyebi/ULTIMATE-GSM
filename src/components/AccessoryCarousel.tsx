"use client";

import Link from "next/link";
import { useRef } from "react";
import { accessories } from "@/lib/catalog";

export function askAbout(product: string) {
  window.dispatchEvent(new CustomEvent("ugsm-chat", { detail: { product } }));
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 4h9v9M16 4 5 15" />
    </svg>
  );
}

export function AccessoryCarousel() {
  const track = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: number) {
    const node = track.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({ left: dir * Math.min(node.clientWidth * 0.86, 320), behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div>
      <div className="carousel-head">
        <div>
          <p className="kicker">Ultimate GSM Store</p>
          <h2>Oraimo essentials, selected.</h2>
        </div>
        <div className="carousel-btns">
          <button type="button" className="icon-btn" aria-label="Previous products" onClick={() => scrollByDir(-1)}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12.5 4-6 6 6 6" /></svg>
          </button>
          <button type="button" className="icon-btn" aria-label="Next products" onClick={() => scrollByDir(1)}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m7.5 4 6 6-6 6" /></svg>
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="carousel-track"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Oraimo store products"
      >
        {accessories.map((item) => (
          <article key={item.id} className="acc-card lift">
            <div className="acc-image">
              <span>{item.category}</span>
              <img src={item.image} alt={item.alt} width={640} height={640} loading="lazy" />
            </div>
            <div className="body">
              <p className="product-label">{item.label}</p>
              <h3>{item.name}</h3>
              <p className="muted" style={{ margin: 0 }}>{item.blurb}</p>
              <p className="price-tag">Live price at Oraimo Ghana</p>
              <a className="btn btn-orange ripple" href={item.officialHref} target="_blank" rel="noopener noreferrer">
                Shop official <Arrow />
              </a>
              <button type="button" className="btn btn-ghost ripple" onClick={() => askAbout(item.name)}>
                Ask the bench
              </button>
            </div>
          </article>
        ))}
      </div>
      <Link href="/store" className="store-text-link">
        Explore the complete store <span aria-hidden="true">—</span>
      </Link>
    </div>
  );
}
