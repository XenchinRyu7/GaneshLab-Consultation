import { LangSwitcher } from "@/components/lang-switcher";
import { Toaster } from "@/components/ui/sonner";

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <LangSwitcher />
      </div>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
}
