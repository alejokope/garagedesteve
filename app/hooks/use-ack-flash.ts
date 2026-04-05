"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Pulso breve en botones (carrito / favoritos) respetando cleanup. */
export function useAckFlash(durationMs = 650) {
  const [on, setOn] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const trigger = useCallback(() => {
    if (tRef.current !== undefined) clearTimeout(tRef.current);
    setOn(true);
    tRef.current = setTimeout(() => {
      setOn(false);
      tRef.current = undefined;
    }, durationMs);
  }, [durationMs]);

  useEffect(
    () => () => {
      if (tRef.current !== undefined) clearTimeout(tRef.current);
    },
    [],
  );

  return { on, trigger };
}
