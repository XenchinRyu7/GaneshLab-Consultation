import { Toaster } from "@/components/ui/sonner";

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
}
