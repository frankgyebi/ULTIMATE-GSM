import type { Metadata } from "next";
import { Suspense } from "react";
import { Tracker } from "@/components/Tracker";

export const metadata: Metadata = {
  title: "Track a repair",
  description: "Track an Ultimate GSM repair with your reference number.",
};

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="wrap"><p>Loading the tracker…</p></div>}>
      <Tracker />
    </Suspense>
  );
}
