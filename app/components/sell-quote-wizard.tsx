"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSellQuotes } from "@/app/context/sell-quotes-context";
import { useTradeIn } from "@/app/context/trade-in-context";
import {
  batteryShortLabel,
  findSellPriceRow,
  formatIphoneModelLabel,
  formatSellPrice,
  type SellCurrency,
  type SellPricingPayload,
  type SellPricingRow,
  uniqueSortedModels,
} from "@/lib/sell-pricing-schema";
import type { SellQuote } from "@/lib/sell-quote";

type Phase = "intro" | "model" | "capacity" | "battery" | "result";

type Props = {
  config: SellPricingPayload;
  whatsappHref: string | null;
  /** En bottom sheet móvil las acciones van al flujo (sin barra fija al viewport). */
  variant?: "page" | "bottomSheet";
};

function normalizeModelKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function capacitiesForModel(rows: SellPricingRow[], model: string): number[] {
  const mk = normalizeModelKey(model);
  const set = new Set<number>();
  for (const r of rows) {
    if (normalizeModelKey(r.model) === mk) set.add(r.capacityGb);
  }
  return [...set].sort((a, b) => a - b);
}

function batteriesForSelection(
  rows: SellPricingRow[],
  model: string,
  capacityGb: number,
): string[] {
  const mk = normalizeModelKey(model);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    if (normalizeModelKey(r.model) !== mk) continue;
    if (r.capacityGb !== capacityGb) continue;
    const b = r.battery.trim();
    if (b && !seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  return out;
}

function offerSnapshotKey(
  match: SellPricingRow | null,
  model: string | null,
  capacityGb: number | null,
  battery: string | null,
  defaultCur: SellCurrency,
): string {
  if (!match || !model || capacityGb === null || !battery) return "";
  const cur =
    match.currency === "ARS" || match.currency === "USD" ? match.currency : defaultCur;
  return [
    normalizeModelKey(model),
    capacityGb,
    battery.trim(),
    match.price,
    cur,
    match.quality.trim().slice(0, 80),
  ].join("|");
}

const PHASES: Phase[] = ["intro", "model", "capacity", "battery", "result"];

function phaseIndex(p: Phase): number {
  return PHASES.indexOf(p);
}

export function SellQuoteWizard({ config, whatsappHref, variant = "page" }: Props) {
  const rows = config.rows;
  const models = useMemo(() => uniqueSortedModels(rows), [rows]);
  const { setOffer } = useTradeIn();
  const { addQuote } = useSellQuotes();

  const [phase, setPhase] = useState<Phase>("intro");
  const [model, setModel] = useState<string | null>(null);
  const [capacityGb, setCapacityGb] = useState<number | null>(null);
  const [battery, setBattery] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const lastSyncedKey = useRef("");

  useEffect(() => {
    if (models.length === 0) return;
    if (!model || !models.some((m) => normalizeModelKey(m) === normalizeModelKey(model))) {
      setModel(models[0] ?? null);
    }
  }, [models, model]);

  const caps = useMemo(() => {
    if (!model) return [];
    return capacitiesForModel(rows, model);
  }, [rows, model]);

  useEffect(() => {
    if (caps.length === 0) {
      setCapacityGb(null);
      return;
    }
    if (capacityGb === null || !caps.includes(capacityGb)) {
      setCapacityGb(caps[0] ?? null);
    }
  }, [caps, capacityGb]);

  const bats = useMemo(() => {
    if (!model || capacityGb === null) return [];
    return batteriesForSelection(rows, model, capacityGb);
  }, [rows, model, capacityGb]);

  useEffect(() => {
    if (bats.length === 0) {
      setBattery(null);
      return;
    }
    if (battery === null || !bats.includes(battery)) {
      setBattery(bats[0] ?? null);
    }
  }, [bats, battery]);

  const match = useMemo(() => {
    if (!model || capacityGb === null || !battery) return null;
    return findSellPriceRow(rows, {
      product: "IPHONE",
      model,
      capacityGb,
      battery,
    });
  }, [rows, model, capacityGb, battery]);

  const defaultCur = config.defaultCurrency;
  const displayCurrency: SellCurrency =
    match?.currency === "ARS" || match?.currency === "USD" ? match.currency : defaultCur;

  const priceLabel = match
    ? formatSellPrice(match.price, displayCurrency)
    : "—";

  useEffect(() => {
    if (phase !== "result") return;
    const key = offerSnapshotKey(match, model, capacityGb, battery, defaultCur);
    if (!key || !match || !model || capacityGb === null || !battery) return;
    if (key === lastSyncedKey.current) return;
    lastSyncedKey.current = key;
    const cur: SellCurrency =
      match.currency === "ARS" || match.currency === "USD" ? match.currency : defaultCur;
    setOffer({
      v: 1,
      savedAt: new Date().toISOString(),
      product: match.product.trim() || "IPHONE",
      model,
      modelDisplay: formatIphoneModelLabel(model),
      capacityGb,
      battery,
      batteryShort: batteryShortLabel(battery),
      quality: match.quality,
      price: match.price,
      currency: cur,
    });
  }, [phase, match, model, capacityGb, battery, defaultCur, setOffer]);

  const goBack = useCallback(() => {
    if (phase === "model") setPhase("intro");
    else if (phase === "capacity") setPhase("model");
    else if (phase === "battery") setPhase("capacity");
    else if (phase === "result") setPhase("battery");
  }, [phase]);

  const stepForBar = phaseIndex(phase);

  const buildCurrentQuotePayload = useCallback((): Omit<SellQuote, "id" | "createdAt"> | null => {
    if (!match || !model || capacityGb === null || !battery) return null;
    const cur: SellCurrency =
      match.currency === "ARS" || match.currency === "USD" ? match.currency : defaultCur;
    return {
      product: match.product.trim() || "IPHONE",
      model,
      modelDisplay: formatIphoneModelLabel(model),
      capacityGb,
      battery,
      batteryShort: batteryShortLabel(battery),
      quality: match.quality,
      price: match.price,
      currency: cur,
    };
  }, [match, model, capacityGb, battery, defaultCur]);

  const saveToList = useCallback(() => {
    const payload = buildCurrentQuotePayload();
    if (!payload) return;
    addQuote(payload);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2800);
  }, [addQuote, buildCurrentQuotePayload]);

  if (models.length === 0) {
    return null;
  }

  const showProgress = phase !== "intro";
  const isResult = phase === "result";
  const inSheet = variant === "bottomSheet";
  const showViewportDock = isResult && !inSheet;

  return (
    <div
      className={`relative w-full ${showViewportDock ? "pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0" : ""}`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-neutral-50 to-white shadow-[var(--glow)] sm:rounded-3xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 100% 60% at 50% -20%, rgba(0,0,0,0.06), transparent 55%)",
          }}
          aria-hidden
        />

        <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {showProgress ? (
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4].map((stepNum) => {
                  const done = stepForBar > stepNum;
                  const current = stepForBar === stepNum;
                  return (
                    <div
                      key={stepNum}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        done ? "bg-neutral-900" : current ? "bg-neutral-700" : "bg-neutral-200"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {Math.min(4, Math.max(0, stepForBar))} / 4
              </span>
            </div>
          ) : null}

          {phase === "intro" ? (
            <div className="mx-auto max-w-lg text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700/90">
                Experiencia guiada
              </p>
              <h2 className="mt-3 font-display text-balance text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                Cotizá tu iPhone en un minuto
              </h2>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-neutral-600 sm:text-base">
                Te vamos a hacer tres preguntas simples. Con tus respuestas armamos un{" "}
                <span className="font-semibold text-neutral-900">valor de referencia</span> según
                nuestra tabla. Después podés guardar la cotización, usarla en el carrito o mandarla
                por WhatsApp.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setPhase("model")}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-neutral-950 px-8 text-base font-semibold text-white shadow-lg transition hover:bg-neutral-800 sm:w-auto sm:min-w-[12rem]"
                >
                  Comenzar
                </button>
                <Link
                  href="/cotizaciones-usados"
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 sm:w-auto"
                >
                  Ver mis cotizaciones guardadas
                </Link>
              </div>
            </div>
          ) : null}

          {phase === "model" ? (
            <div className="mx-auto max-w-xl">
              <button
                type="button"
                onClick={goBack}
                className="mb-4 text-sm font-medium text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
              >
                ← Atrás
              </button>
              <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                ¿Qué iPhone querés cotizar?
              </h2>
              <p className="mt-2 text-sm text-neutral-600 sm:text-[15px]">
                Elegí el modelo que mejor represente al tuyo. Si no está en la lista, pedinos por
                WhatsApp.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {models.map((m) => {
                  const active =
                    model !== null && normalizeModelKey(m) === normalizeModelKey(model);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setModel(m);
                        setPhase("capacity");
                      }}
                      className={`flex min-h-[52px] w-full items-center rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition sm:min-h-[56px] sm:px-5 ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                          : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                      }`}
                    >
                      {formatIphoneModelLabel(m)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {phase === "capacity" ? (
            <div className="mx-auto max-w-md">
              <button
                type="button"
                onClick={goBack}
                className="mb-4 text-sm font-medium text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
              >
                ← Atrás
              </button>
              <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                ¿Cuánta memoria tiene?
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                La capacidad que ves en Ajustes → General → Información.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {caps.map((gb) => (
                  <button
                    key={gb}
                    type="button"
                    onClick={() => {
                      setCapacityGb(gb);
                      setPhase("battery");
                    }}
                    className="flex min-h-[52px] min-w-[5.5rem] items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 text-base font-bold tabular-nums text-neutral-900 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-50"
                  >
                    {gb} GB
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {phase === "battery" ? (
            <div className="mx-auto max-w-lg">
              <button
                type="button"
                onClick={goBack}
                className="mb-4 text-sm font-medium text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
              >
                ← Atrás
              </button>
              <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                ¿Cómo está la batería?
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Según el porcentaje de salud máxima que muestra el iPhone (Ajustes → Batería → Salud
                de batería).
              </p>
              <div className="mt-6 space-y-3">
                {bats.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setBattery(b);
                      setPhase("result");
                    }}
                    className="flex w-full min-h-[4.5rem] flex-col items-start gap-1 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-neutral-900 sm:px-5"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      {batteryShortLabel(b)}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">{b}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {phase === "result" && match && model && capacityGb !== null && battery ? (
            <div className="mx-auto max-w-xl">
              <button
                type="button"
                onClick={goBack}
                className="mb-4 text-sm font-medium text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
              >
                ← Cambiar respuestas
              </button>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                Tu referencia
              </p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
                {priceLabel}
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                {formatIphoneModelLabel(model)} · {capacityGb} GB · {batteryShortLabel(battery)}
              </p>
              <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/90 p-3 text-xs leading-relaxed text-neutral-600">
                {match.quality}
              </p>
              <p className="mt-3 text-xs text-neutral-500">{config.legalNote}</p>

              <div
                className={`mt-8 gap-2.5 ${inSheet ? "grid" : "hidden sm:grid"} ${whatsappHref ? "grid-cols-3" : "grid-cols-2"}`}
              >
                <button
                  type="button"
                  onClick={saveToList}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400"
                >
                  {inSheet ? "Guardar" : "Guardar cotización"}
                </button>
                <Link
                  href="/carrito"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Ir al carrito
                </Link>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {savedToast ? (
        <p
          className={`pointer-events-none fixed left-1/2 z-[95] -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-lg ${
            inSheet
              ? "bottom-[max(1rem,env(safe-area-inset-bottom))]"
              : "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] lg:bottom-8"
          }`}
          role="status"
        >
          Guardada en &quot;Mis cotizaciones&quot;
        </p>
      ) : null}

      {phase === "result" && match && !inSheet ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/90 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <div
            className={`mx-auto grid max-w-lg gap-2 ${whatsappHref ? "grid-cols-3" : "grid-cols-2"}`}
          >
            <button
              type="button"
              onClick={saveToList}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 sm:text-sm"
            >
              Guardar
            </button>
            <Link
              href="/carrito"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-neutral-950 text-xs font-semibold text-white sm:text-sm"
            >
              Carrito
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] text-xs font-semibold text-white sm:text-sm"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
