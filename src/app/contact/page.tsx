import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ultimate GSM for phone repairs and Oraimo accessories.",
};

export default function ContactPage() {
  return (
    <div className="wrap" style={{ paddingBottom: 72 }}>
      <div className="page-hero">
        <p className="kicker">Contact</p>
        <h1>Talk to the bench.</h1>
        <p className="lede">Call, write, or send a note. Real details replace the placeholders below.</p>
      </div>
      <div className="info-grid">
        <div className="info-card">
          <h2>Shop</h2>
          <p><strong>Address</strong><br />{site.address}</p>
          <p><strong>Phone</strong><br /><a href={`tel:${site.phone}`}>{site.phone}</a></p>
          <p><strong>Email</strong><br /><a href={`mailto:${site.email}`}>{site.email}</a></p>
          <p><strong>Hours</strong><br />{site.hours}</p>
          <p><strong>WhatsApp</strong><br />{site.whatsappLink}</p>
          <a className="btn btn-orange ripple" href={whatsappUrl("Hello Ultimate GSM.")} target="_blank" rel="noopener noreferrer">
            Open WhatsApp
          </a>
          <div className="map-ph" style={{ marginTop: 16 }} role="img" aria-label="Map placeholder until the address is set">
            Map connects when {site.address} is a real address.
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
