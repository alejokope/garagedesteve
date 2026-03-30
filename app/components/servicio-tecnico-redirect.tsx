"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ServicioTecnicoRedirect({
  hash,
}: {
  hash: "precios" | "seguimiento";
}) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/servicio-tecnico#${hash}`);
  }, [router, hash]);
  return (
    <div className="flex min-h-[30vh] items-center justify-center bg-[#f9fafb] text-sm text-neutral-500">
      Redirigiendo al servicio técnico…
    </div>
  );
}
