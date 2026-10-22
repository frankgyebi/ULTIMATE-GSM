import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="brand" aria-label="Ultimate GSM home">
            <LogoMark />
            <span>
              <span className="wordmark">
                ultimate<em>gsm</em>
              </span>
              <small>We fix it. You love it.</small>
            </span>
          </Link>
          <p className="muted" style={{ marginTop: 14 }}>
            Expert phone repairs. Quality you can trust. Screens, batteries, board-level work, and a curated Oraimo store.
          </p>
        </div>
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: 10 }}>Visit</h2>
          <ul>
            <li>{site.address}</li>
            <li>
              <a href={`tel:${site.phone}`}>{site.phone}</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>Hours: {site.hours}</li>
            <li>WhatsApp: {site.whatsappLink}</li>
          </ul>
        </div>
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: 10 }}>Explore</h2>
          <ul>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/store">Oraimo store</Link></li>
            <li><a href={site.oraimoDealsUrl} target="_blank" rel="noopener noreferrer">Official daily deals</a></li>
            <li><Link href="/book">Book a repair</Link></li>
            <li><Link href="/track">Track a repair</Link></li>
            <li><Link href="/about">About the bench</Link></li>
          </ul>
        </div>
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: 10 }}>Bench</h2>
          <ul>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/desk">Staff board</Link></li>
            <li>Form endpoint: {site.formEndpoint}</li>
          </ul>
        </div>
      </div>
      <div className="wrap legal">
        <p>
          Prices, turnaround, and warranty terms are confirmed per job. Placeholders are marked [PLACEHOLDER], [HOURS], [ADDRESS], [PHONE NUMBER], [EMAIL], [WHATSAPP LINK], and [FORM ENDPOINT]. The open badge uses a stand-in schedule (Mon–Sat 9:00 AM–6:00 PM, Sunday closed) until real hours are connected.
        </p>
        <p>© {new Date().getFullYear()} Ultimate GSM. Phone Repair Specialist.</p>
      </div>
    </footer>
  );
}
