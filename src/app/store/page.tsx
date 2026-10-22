import type { Metadata } from "next";
import { Storefront } from "@/components/Storefront";

export const metadata: Metadata = {
  title: "Oraimo Store",
  description:
    "Shop a curated Oraimo collection from Ultimate GSM, then check live Ghana pricing and availability at the official Oraimo store.",
};

export default function StorePage() {
  return (
    <div className="wrap store-page">
      <Storefront />
    </div>
  );
}
