import Link from "next/link";
import { AccessoryCarousel } from "@/components/AccessoryCarousel";
import { Hero } from "@/components/Hero";
import { ServiceGrid } from "@/components/ServiceGrid";
import { services } from "@/lib/catalog";
import { site } from "@/lib/site";

const featured = services.filter((service) =>
  ["screen-repair", "battery-replacement", "water-damage", "charging"].includes(service.id),
);

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="led" aria-hidden="true" />
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, copy) => (
            <span key={copy}>
              {services.map((service) => (
                <span key={`${copy}-${service.id}`}>
                  {service.name}
                  <i />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">The bench</p>
            <h2>Expert phone repairs.</h2>
            <p className="lede">Quality you can trust. Hover or tap a card to see what the work involves, then start that repair.</p>
          </div>
          <ServiceGrid items={featured} />
          <p className="muted" style={{ marginTop: 16 }}>
            Also on the bench: software unlock, IC repair / reballing, motherboard repair, and FRP / iCloud unlocking for a device you own.
          </p>
          <Link href="/services" className="btn btn-ghost ripple" style={{ marginTop: 8 }}>
            All services
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">How a booking works</p>
            <h2>From “it is broken” to a reference number.</h2>
          </div>
          <div className="steps">
            <article className="step-card lift">
              <span className="step-no">01</span>
              <div>
                <h3>Tell us the phone</h3>
                <p className="muted">Brand, model, and what it is doing. Not sure is a fine answer.</p>
              </div>
            </article>
            <article className="step-card lift">
              <span className="step-no">02</span>
              <div>
                <h3>Pick a time</h3>
                <p className="muted">Drop it at {site.address}, or ask for pickup. Past times stay closed.</p>
              </div>
            </article>
            <article className="step-card lift">
              <span className="step-no">03</span>
              <div>
                <h3>Track it</h3>
                <p className="muted">You get a reference. Follow Received, Diagnosing, In repair, Ready for pickup.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <AccessoryCarousel />
          <p className="faint">Swipe the collection. Product buttons open live pricing and availability at the official Oraimo Ghana store.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="split">
            <div className="photo-frame">
              <img
                src="/images/technician.jpg"
                alt="Specialist in a royal blue shirt repairing a phone under workshop lighting"
                width={900}
                height={1125}
              />
            </div>
            <div>
              <p className="kicker">Phone repair specialist</p>
              <h2>A real bench. Not a guess.</h2>
              <p className="lede">
                Screens and batteries are the daily work. When the fault sits deeper, the microscope comes out for charging paths, IC repair, and motherboard jobs.
              </p>
              <div className="hero-actions">
                <Link href="/about" className="btn btn-blue ripple">
                  About the bench
                </Link>
                <Link href="/book" className="btn btn-orange btn-pulse ripple">
                  Book a Repair
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="band">
            <div>
              <p className="kicker">Ready when you are</p>
              <h2>We fix it. You love it.</h2>
              <p className="muted">Book in a minute. We confirm on {site.phone}.</p>
            </div>
            <div className="actions">
              <Link href="/book" className="btn btn-orange ripple">
                Book a Repair
              </Link>
              <Link href="/track" className="btn btn-ghost ripple">
                Track a repair
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
