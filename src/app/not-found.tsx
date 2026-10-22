import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-hero" style={{ paddingBottom: 80 }}>
      <p className="kicker">404</p>
      <h1>That page is not on the bench.</h1>
      <p className="lede">The link may be old. Book a repair or head home.</p>
      <div className="hero-actions">
        <Link href="/" className="btn btn-blue ripple">Home</Link>
        <Link href="/book" className="btn btn-orange ripple">Book a Repair</Link>
      </div>
    </div>
  );
}
