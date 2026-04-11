import Link from "next/link";

const steps = [
  {
    title: "Escribinos por WhatsApp",
    body: "Usá el botón de abajo: se abre el chat con un mensaje modelo. Completá modelo, capacidad y estado real del equipo.",
  },
  {
    title: "Te pasamos la cotización",
    body: "En base al modelo, la capacidad, el desgaste y si está liberado y sin iCloud, te respondemos con un valor orientativo.",
  },
  {
    title: "Coordinamos el cierre",
    body: "Si te cierra, acordamos forma de entrega o retiro y los detalles finales sin vueltas.",
  },
] as const;

const criteria = [
  "Modelo y generación del dispositivo",
  "Capacidad (128 GB, 256 GB, etc.)",
  "Estado de pantalla, marcos y carcasa",
  "Batería y rendimiento (cuando aplica)",
  "Si está liberado de operador y sin bloqueo de iCloud",
  "Caja original, cargador y accesorios",
] as const;

type Props = {
  whatsappHref: string | null;
  fallbackEmail: string;
  fallbackPhone: string;
};

export function SellDeviceView({ whatsappHref, fallbackEmail, fallbackPhone }: Props) {
  return (
    <div className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-[calc(4rem+env(safe-area-inset-top))] sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Compra de usados
        </p>
        <h1 className="mt-3 font-display text-balance text-3xl font-semibold leading-tight tracking-tight text-neutral-950 sm:text-4xl">
          Vendé tu equipo con una cotización clara
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-neutral-600 sm:text-lg">
          El valor que te ofrecemos depende de las{" "}
          <strong className="font-semibold text-neutral-950">características de tu celular o dispositivo</strong>{" "}
          (modelo, capacidad, año) y del{" "}
          <strong className="font-semibold text-neutral-950">estado real</strong>: pantalla, marcos, batería, si está
          liberado y sin iCloud, y qué accesorios incluye. Con eso te pasamos una{" "}
          <strong className="font-semibold text-neutral-950">cotización por WhatsApp</strong>, sin compromiso.
        </p>

        {whatsappHref ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pedir cotización por WhatsApp
            </a>
            <Link
              href="/tienda"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-200 px-6 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <p className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            El enlace a WhatsApp no está configurado. Escribinos a{" "}
            <a href={`mailto:${fallbackEmail}`} className="font-semibold underline underline-offset-2">
              {fallbackEmail}
            </a>{" "}
            o al{" "}
            <a href={`tel:${fallbackPhone.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-2">
              {fallbackPhone}
            </a>{" "}
            para cotizar tu equipo.
          </p>
        )}

        <section className="mt-16 border-t border-[var(--border)] pt-14">
          <h2 className="font-display text-xl font-semibold text-neutral-950 sm:text-2xl">Cómo funciona</h2>
          <ol className="mt-8 space-y-8">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-bold text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-neutral-950">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-neutral-950 sm:text-2xl">Qué miramos para cotizar</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Cuanto más preciso sea el dato, más ajustada puede ser la cotización. Nada de letra chica: si al ver el equipo
            hay diferencias, lo charlamos por el mismo canal.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-neutral-700">
            {criteria.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 text-[var(--brand-from)]" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {whatsappHref ? (
          <div className="mt-14 rounded-2xl border border-[var(--border)] bg-[#fafafa] p-6 sm:p-8">
            <p className="text-center font-display text-lg font-semibold text-neutral-950">
              ¿Listo para saber cuánto vale el tuyo?
            </p>
            <p className="mt-2 text-center text-sm text-neutral-600">
              Abrí WhatsApp, completá el mensaje y en breve te respondemos.
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 text-sm font-semibold text-white shadow-md transition hover:bg-[#20bd5a] sm:w-auto"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ir a WhatsApp
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
