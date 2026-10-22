import type { Metadata } from "next";
import Link from "next/link";
import { Counters } from "@/components/Counters";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Ultimate GSM is a phone repair specialist. We fix it. You love it.",
};

export default function AboutPage() {
  return (
    <div className="wrap" style={{ paddingBottom: 72 }}>
      <div className="page-hero">
        <p className="kicker">{site.slogan}</p>
        <h1>We fix it. You love it.</h1>
      </div>
      <div className="split">
        <figure className="photo-frame" style={{ margin: 0 }}>
          <span className="frame-mark tl" aria-hidden="true" />
          <span className="frame-mark br" aria-hidden="true" />
          <img
            src="/images/technician.jpg"
            alt="Ultimate GSM specialist in a blue work shirt repairing an opened phone at the bench"
            width={900}
            height={1125}
          />
        </figure>
        <div>
          <p className="lede">
            Ultimate GSM is a phone repair specialist. The blue shirt is the bench. The work is screens, batteries, water damage, charging faults, software locks, and board-level repairs when a part swap will not do.
          </p>
          <p className="muted">
            The Ultimate GSM Store brings together Oraimo chargers, power banks, data cables, wireless audio, and car chargers for the moments when the phone needs the right accessory instead of a repair.
          </p>
          <p className="muted">
            Drop-off is at {site.address}. Pickup is arranged when we call {site.phone}. Hours on the site stay {site.hours} until the real schedule is connected.
          </p>
          <div className="hero-actions">
            <Link href="/book" className="btn btn-orange ripple">
              Book a Repair
            </Link>
            <Link href="/contact" className="btn btn-ghost ripple">
              Contact
            </Link>
          </div>
        </div>
      </div>
      <div style={{ height: 36 }} />
      <Counters />
      <p className="faint">Counters resolve to [X]. Connect real totals in the about page when you have them. These are placeholders, not claims.</p>
      <div className="steps" style={{ marginTop: 28 }}>
        <article className="step-card">
          <span className="step-no">01</span>
          <div>
            <h3>Look first</h3>
            <p className="muted">We name the fault before heavy work. Not sure is a valid booking.</p>
          </div>
        </article>
        <article className="step-card">
          <span className="step-no">02</span>
          <div>
            <h3>Board-level when needed</h3>
            <p className="muted">IC repair, reballing, and motherboard jobs sit next to everyday screen and battery work.</p>
          </div>
        </article>
        <article className="step-card">
          <span className="step-no">03</span>
          <div>
            <h3>A reference you can track</h3>
            <p className="muted">Every website booking is stored, then shown on the tracker as it moves.</p>
          </div>
        </article>
      </div>
    </div>
  );
}
