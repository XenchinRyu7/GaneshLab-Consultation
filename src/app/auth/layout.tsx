import { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
