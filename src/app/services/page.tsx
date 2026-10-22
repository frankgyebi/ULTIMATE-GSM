import type { Metadata } from "next";
import Link from "next/link";
import { ServiceGrid } from "@/components/ServiceGrid";

export const metadata: Metadata = {
  title: "Services",
  description: "Screen repair, battery replacement, water damage, software unlock, IC reballing, motherboard repair, charging issues, and FRP/iCloud unlocking.",
};

export default function ServicesPage() {
  return (
    <div className="wrap" style={{ paddingBottom: 64 }}>
      <div className="page-hero">
        <p className="kicker">Services</p>
        <h1>Expert phone repairs.</h1>
        <p className="lede">Quality you can trust. Flip a card for what the job involves. Turnaround stays [PLACEHOLDER] until we see the phone.</p>
      </div>
      <div className="split" style={{ margin: "12px 0 28px" }}>
        <img
          src="/images/board.jpg"
          alt="Close view of a smartphone board under a repair light"
          width={1200}
          height={800}
          loading="lazy"
          style={{ borderRadius: 24, border: "1px solid rgba(255,255,255,.1)", width: "100%", height: "auto" }}
        />
        <div>
          <h2>Hardware, software, and the board between them.</h2>
          <p className="muted">
            Screen repair, battery replacement, water damage, software unlock, IC repair / reballing, motherboard repair, charging issues, and FRP / iCloud unlocking for a device you own.
          </p>
          <p className="note">We do not publish bypass steps. Account-lock work starts with a confirmed model and lock type.</p>
        </div>
      </div>
      <ServiceGrid />
      <div className="band" style={{ marginTop: 28 }}>
        <div>
          <h2>Not sure which one?</h2>
          <p className="muted">Start the wizard and choose Not sure. We will name the fault before any repair.</p>
        </div>
        <Link href="/book?service=not-sure&fresh=1" className="btn btn-orange ripple">
          Start this repair
        </Link>
      </div>
    </div>
  );
}
