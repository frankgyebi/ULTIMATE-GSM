import type { Metadata } from "next";
import { Suspense } from "react";
import { RepairWizard } from "@/components/RepairWizard";

export const metadata: Metadata = {
  title: "Book a repair",
  description: "Book a phone repair with Ultimate GSM. Choose the device, the fault, and a time.",
};

export default function BookPage() {
  return (
    <Suspense fallback={<div className="wrap wizard"><p>Loading the booking wizard…</p></div>}>
      <RepairWizard />
    </Suspense>
  );
}
