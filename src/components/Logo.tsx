export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="14.5" y="4" width="19" height="36" rx="4.5" fill="#0c1018" stroke="white" strokeWidth="2.2" />
      <rect x="20.5" y="33.2" width="7" height="2.2" rx="1.1" fill="white" />
      <path
        fill="#1E6FD9"
        d="M31.6 12.1a4.6 4.6 0 0 0-6.2 5.4L17.8 25.1a2 2 0 0 0 0 2.8l2.1 2.1a2 2 0 0 0 2.8 0l7.6-7.6a4.6 4.6 0 0 0 5.4-6.2l-2.8 2.8-2.4-2.4 2.8-2.8z"
      />
    </svg>
  );
}

export function ServiceIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "battery":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="16" height="10" rx="2" />
          <path d="M19 10h2v4h-2M7 12h6" />
        </svg>
      );
    case "water":
      return (
        <svg {...common}>
          <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <path d="M9 3v4M12 3v4M15 3v4M9 17v4M12 17v4M15 17v4M3 9h4M3 12h4M3 15h4M17 9h4M17 12h4M17 15h4" />
        </svg>
      );
    case "board":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h4v4H7zM13 14h4M8 16h3" />
        </svg>
      );
    case "charge":
      return (
        <svg {...common}>
          <path d="M13 2 6 13h5l-1 9 8-12h-5l0-8Z" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3.5 3.5 0 0 0 7 18Z" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.2 1-1.2 1.7V14" />
          <path d="M12 17h.01" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M9 18h6M10 5h4" />
        </svg>
      );
  }
}
