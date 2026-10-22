import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="page-fade">
      {children}
    </main>
  );
}
