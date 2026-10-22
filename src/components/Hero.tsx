import Link from "next/link";

// The video now lives in SiteBackground (behind every page), so the hero only holds copy and the portrait.
export function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-shade" />
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="kicker reveal d1">Phone Repair Specialist</p>
          <h1 className="reveal d2">
            <span className="line">We fix it.</span>
            <span className="line accent">You love it.</span>
          </h1>
          <p className="lede reveal d3">Expert phone repairs. Quality you can trust.</p>
          <div className="hero-actions reveal d4">
            <Link href="/book" className="btn btn-orange btn-pulse ripple">
              Book a Repair
            </Link>
            <Link href="/track" className="btn btn-ghost ripple">
              Track a repair
            </Link>
          </div>
          <ul className="hero-points reveal d5">
            <li>Screen repair</li>
            <li>Battery</li>
            <li>Water damage</li>
            <li>Board-level</li>
            <li>Oraimo store</li>
          </ul>
        </div>
        <figure className="hero-portrait">
          <span className="frame-mark tl" aria-hidden="true" />
          <span className="frame-mark br" aria-hidden="true" />
          <img
            src="/images/technician.jpg"
            alt="Phone repair specialist in a blue shirt working on an opened smartphone at the Ultimate GSM bench"
            width={900}
            height={1125}
          />
          <figcaption className="portrait-chip">
            <i aria-hidden="true" />
            On the bench
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
