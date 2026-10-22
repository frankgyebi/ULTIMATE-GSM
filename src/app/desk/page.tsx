import type { Metadata } from "next";
import { DeskBoard } from "@/components/DeskBoard";

export const metadata: Metadata = {
  title: "Bench board",
  description: "Staff view for Ultimate GSM repair status.",
};

export default function DeskPage() {
  return <DeskBoard />;
}
