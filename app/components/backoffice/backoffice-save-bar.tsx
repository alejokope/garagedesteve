"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type BackofficeSaveBarSnapshot = {
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  onSave: () => Promise<void>;
  onDiscard?: () => void;
};

type Cell = { priority: number; snapshot: BackofficeSaveBarSnapshot };

function mergeSnapshots(snapshots: BackofficeSaveBarSnapshot[]): BackofficeSaveBarSnapshot {
  if (snapshots.length === 1) return snapshots[0]!;
  const errs = snapshots.map((s) => s.error).filter(Boolean);
  return {
    isDirty: snapshots.some((s) => s.isDirty || Boolean(s.error)),
    isSaving: snapshots.some((s) => s.isSaving),
    error: errs.length ? errs.join(" — ") : null,
    onSave: async () => {
      for (const s of snapshots) await s.onSave();
    },
    onDiscard: () => {
      for (const s of snapshots) s.onDiscard?.();
    },
  };
}

type Ctx = {
  subscribe: (id: string, priority: number, snapshot: BackofficeSaveBarSnapshot | null) => void;
  unsubscribe: (id: string) => void;
};

const BackofficeSaveBarContext = createContext<Ctx | null>(null);

function FloatingSaveBar({ snapshot }: { snapshot: BackofficeSaveBarSnapshot | null }) {
  const show =
    snapshot && (snapshot.isDirty || snapshot.isSaving || Boolean(snapshot.error));

  if (!show || !snapshot) return null;

  const canSave = snapshot.isDirty || Boolean(snapshot.error);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-4 pt-2 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] lg:pl-64"
      role="region"
      aria-label="Guardar cambios del panel"
    >
      <div className="pointer-events-auto flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-white/[0.12] bg-slate-950/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0 flex-1 space-y-1">
          {snapshot.error ? (
            <p className="text-sm text-red-300/95">{snapshot.error}</p>
          ) : snapshot.isSaving ? (
            <p className="text-sm text-slate-400">Guardando…</p>
          ) : (
            <p className="text-sm text-slate-400">Tenés cambios sin guardar en esta página.</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {snapshot.onDiscard && snapshot.isDirty && !snapshot.isSaving ? (
            <button
              type="button"
              onClick={() => snapshot.onDiscard?.()}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Descartar
            </button>
          ) : null}
          <button
            type="button"
            disabled={snapshot.isSaving || !canSave}
            onClick={() => void snapshot.onSave()}
            className="min-w-[160px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-50"
          >
            {snapshot.isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BackofficeSaveBarProvider({ children }: { children: ReactNode }) {
  const cellsRef = useRef(new Map<string, Cell>());
  const [merged, setMerged] = useState<BackofficeSaveBarSnapshot | null>(null);

  const recompute = useCallback(() => {
    const ordered = [...cellsRef.current.values()]
      .sort((a, b) => a.priority - b.priority)
      .map((c) => c.snapshot);
    if (ordered.length === 0) setMerged(null);
    else if (ordered.length === 1) setMerged(ordered[0]!);
    else setMerged(mergeSnapshots(ordered));
  }, []);

  const subscribe = useCallback(
    (id: string, priority: number, snapshot: BackofficeSaveBarSnapshot | null) => {
      if (snapshot && (snapshot.isDirty || snapshot.isSaving || snapshot.error)) {
        cellsRef.current.set(id, { priority, snapshot });
      } else {
        cellsRef.current.delete(id);
      }
      recompute();
    },
    [recompute],
  );

  const unsubscribe = useCallback(
    (id: string) => {
      cellsRef.current.delete(id);
      recompute();
    },
    [recompute],
  );

  const value = useMemo(() => ({ subscribe, unsubscribe }), [subscribe, unsubscribe]);

  return (
    <BackofficeSaveBarContext.Provider value={value}>
      {children}
      <FloatingSaveBar snapshot={merged} />
    </BackofficeSaveBarContext.Provider>
  );
}

export type BackofficeSaveBarReporterOptions = {
  /** Menor número = se ejecuta antes en “Guardar” cuando hay varios borradores a la vez. */
  priority?: number;
};

/**
 * Publica la barra flotante de guardado. Varios componentes en la misma página pueden reportar;
 * se combinan en un solo “Guardar cambios” (en orden de `priority`).
 * Pasá `null` cuando no haya nada que guardar (sin borrador sucio ni error).
 */
export function useBackofficeSaveBarReporter(
  snapshot: BackofficeSaveBarSnapshot | null,
  opts?: BackofficeSaveBarReporterOptions,
) {
  const ctx = useContext(BackofficeSaveBarContext);
  const id = useId();
  const priority = opts?.priority ?? 0;

  const saveRef = useRef(snapshot?.onSave);
  const discardRef = useRef(snapshot?.onDiscard);
  saveRef.current = snapshot?.onSave;
  discardRef.current = snapshot?.onDiscard;

  const dirty = Boolean(snapshot?.isDirty);
  const saving = Boolean(snapshot?.isSaving);
  const err = snapshot?.error ?? null;
  const snapshotPresent = snapshot != null;
  const active = snapshotPresent && (dirty || saving || Boolean(err));

  useLayoutEffect(() => {
    if (!ctx) return;
    if (!active) {
      ctx.subscribe(id, priority, null);
      return () => ctx.unsubscribe(id);
    }
    ctx.subscribe(id, priority, {
      isDirty: dirty,
      isSaving: saving,
      error: err,
      onSave: async () => {
        await saveRef.current?.();
      },
      onDiscard: discardRef.current ? () => discardRef.current?.() : undefined,
    });
    return () => ctx.unsubscribe(id);
  }, [ctx, id, priority, active, dirty, saving, err]);

  useEffect(() => {
    if (!dirty) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
}
