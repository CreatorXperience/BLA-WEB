"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: 0,
          border: "1px solid #eaeaea",
          background: "#ffffff",
          color: "#111111",
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  );
}