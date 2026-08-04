import type { Metadata } from "next";
import { ContactClient } from "@/features/contact/contact-client";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the BLA team.",
};

export default function ContactPage() {
  return <ContactClient />;
}
