"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { getOpenState, type OpenState } from "@/lib/site";

const links = [
  { href: "/services", label: "Services" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/track", label: "Track" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OpenState | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const tick = () => setStatus(getOpenState());
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return () => {
      document.body.style.overflow = "";
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Ultimate GSM home">
          <LogoMark />
          <span>
            <span className="wordmark">
              ultimate<em>gsm</em>
            </span>
            <small>Phone Repair Specialist</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <span
            className={`badge${status?.open ? " open" : ""}`}
            title={status?.detail ?? "Hours use a placeholder schedule"}
            aria-label={status?.label ?? "Checking hours"}
          >
            <span className="dot" aria-hidden="true" />
            <span className="short">{status?.open ? "Open" : "Closed"}</span>
            <span className="full">{status?.label ?? "Checking hours"}</span>
          </span>
          <Link href="/book" className="btn btn-orange ripple nav-cta">
            Book a Repair
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      <div id="mobile-nav" className={`nav-panel${open ? " open" : ""}`} hidden={!open}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
        <Link href="/book" className="btn btn-orange ripple">
          Book a Repair
        </Link>
      </div>
    </header>
  );
}
