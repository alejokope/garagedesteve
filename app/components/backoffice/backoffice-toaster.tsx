"use client";

import { Toaster } from "sonner";

/** Toasts del panel (Sonner). En client: `import { toast } from "sonner"`. */
export function BackofficeToaster() {
  return (
    <Toaster
      className="toaster-backoffice"
      style={{ zIndex: 99999 }}
      position="top-center"
      theme="dark"
      richColors
      closeButton
      expand={false}
      gap={12}
      offset={{ top: "5.5rem" }}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
            "group border border-white/[0.12] bg-[#0f1118]/95 text-slate-100 shadow-2xl shadow-black/50 backdrop-blur-xl",
          title: "font-medium text-[15px] text-white",
          description: "text-sm text-slate-400",
          success: "border-emerald-500/35 !bg-emerald-950/90",
          error: "border-red-500/40 !bg-red-950/90",
          closeButton:
            "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
        },
      }}
    />
  );
}
